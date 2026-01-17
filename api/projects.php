<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM projects ORDER BY created_at DESC");
        $projects = $stmt->fetchAll();
        echo json_encode($projects);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Hem Ekleme Hem Güncelleme (Dosya yükleme nedeniyle POST kullanıyoruz)

    // FormData ile geldiği için $_POST ve $_FILES kullanacağız, php://input değil.

    $id = $_POST['id'] ?? null;
    $title = $_POST['title'] ?? '';
    $category = $_POST['category'] ?? '';
    $status = $_POST['status'] ?? 'pending';

    $site_url = $_POST['site_url'] ?? '';
    $download_url = $_POST['download_url'] ?? '';
    $social_instagram = $_POST['social_instagram'] ?? '';
    $social_facebook = $_POST['social_facebook'] ?? '';
    $social_x = $_POST['social_x'] ?? '';

    // Basit Validasyon
    if (empty($title) || empty($category)) {
        http_response_code(400);
        echo json_encode(['error' => 'Başlık ve kategori zorunludur.']);
        exit;
    }

    // Dosya Yükleme İşlemi
    $logo_url = null;

    // Eğer güncelleme ise mevcut logoyu korumak isteyebiliriz, ama burada dosya gelirse üzerine yazacağız.
    // Veritabanından mevcut bilgiyi çekmiyoruz, sadece dosya varsa yeni path oluşturuyoruz.

    if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/';
        // Klasör yoksa oluştur (güvenlik için önceden oluşturulması önerilir ama burada da deneriz)
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileTmpPath = $_FILES['logo']['tmp_name'];
        $fileName = $_FILES['logo']['name'];
        $fileSize = $_FILES['logo']['size'];
        $fileType = $_FILES['logo']['type'];

        // Uzantıyı al
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg', 'webp');

        if (in_array($fileExtension, $allowedfileExtensions)) {
            // Benzersiz isim oluştur
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $dest_path = $uploadDir . $newFileName;

            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                // DB'ye kaydedilecek path (frontend'in erişebileceği relative path)
                // api/projects.php'den çağrıldığı için ../uploads/ diye kaydedersek frontend bunu nasıl görür?
                // Frontend index.html root'ta. 
                // DB'ye 'uploads/dosya.jpg' olarak kaydetmek daha mantıklı.
                // $dest_path şu an '../uploads/dosya.jpg'
                $logo_url = 'uploads/' . $newFileName;
            } else {
                // Yükleme hatası ama işlemi durdurmayalım, logosuz devam etsin veya hata verelim.
            }
        }
    }

    try {
        if ($id) {
            // GÜNCELLEME İŞLEMİ
            if ($logo_url) {
                // Yeni logo varsa onu da güncelle
                $sql = "UPDATE projects SET title = ?, category = ?, status = ?, logo_url = ?, site_url = ?, download_url = ?, social_instagram = ?, social_facebook = ?, social_x = ? WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$title, $category, $status, $logo_url, $site_url, $download_url, $social_instagram, $social_facebook, $social_x, $id]);
            } else {
                // Yeni logo yoksa, logo_url sütununu elleme
                $sql = "UPDATE projects SET title = ?, category = ?, status = ?, site_url = ?, download_url = ?, social_instagram = ?, social_facebook = ?, social_x = ? WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$title, $category, $status, $site_url, $download_url, $social_instagram, $social_facebook, $social_x, $id]);
            }
        } else {
            // EKLEME İŞLEMİ
            $sql = "INSERT INTO projects (title, category, status, logo_url, site_url, download_url, social_instagram, social_facebook, social_x) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            // $logo_url null olabilir
            $stmt->execute([$title, $category, $status, $logo_url ?? '', $site_url, $download_url, $social_instagram, $social_facebook, $social_x]);
            // ID dönülebilir ama bu yapıda gerekirse ekleriz
        }

        echo json_encode(['success' => true]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // PUT ARTİK KULLANILMIYOR ÇÜNKÜ DOSYA YÜKLEME İÇİN POST LAZIM
    // Geriye dönük uyumluluk için veya yanlış istek gelirse diye hata veya boş dönebiliriz.
    http_response_code(405);
    echo json_encode(['error' => 'Use POST for updates with file upload support.']);

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Proje Silme
    // DELETE requests usually don't have a body payload in standard usage like this, 
    // so we might look for an ID in the query string: api/projects.php?id=123
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID belirtilmedi.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
?>