<?php
// Veritabanı Bağlantısı (PDO)

$host = 'localhost';
$dbname = 'creinoff_db'; // Hosting panelinizde oluşturduğunuz veritabanı adı
$username = 'root';      // Veritabanı kullanıcı adı
$password = '';          // Veritabanı şifresi

header('Content-Type: application/json; charset=utf-8');

// CORS Ayarları (Geliştirme süreci için * kullanıyoruz, canlıda domain belirtmek daha güvenlidir)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Veritabanı bağlantı hatası: ' . $e->getMessage()]);
    exit;
}
?>
