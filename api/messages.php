<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Mesaj Gönderimi (İletişim Formu)
    $input = json_decode(file_get_contents('php://input'), true);

    // Form data olarak gelirse (x-www-form-urlencoded)
    if (!$input) {
        $input = $_POST;
    }

    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $message = $input['message'] ?? '';

    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tüm alanlar zorunludur.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $message]);
        echo json_encode(['success' => true, 'message' => 'Mesajınız başarıyla iletildi.']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Mesaj kaydedilemedi: ' . $e->getMessage()]);
    }

} elseif ($method === 'GET') {
    // Mesajları Listeleme (Admin Paneli İçin)
    // Not: Gerçek bir projede burada oturum kontrolü yapılmalıdır.
    try {
        $stmt = $pdo->query("SELECT * FROM messages ORDER BY created_at DESC");
        $messages = $stmt->fetchAll();
        echo json_encode($messages);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    // Mesaj Durumu Güncelleme (Okundu/Okunmadı)
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $is_read = $input['is_read'] ?? 0; // 0 or 1

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID gereklidir.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE messages SET is_read = ? WHERE id = ?");
        $stmt->execute([$is_read, $id]);
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