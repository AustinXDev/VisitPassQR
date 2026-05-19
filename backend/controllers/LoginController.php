<?php 
declare(strict_types=1);

class LoginController{
  private ?PDO $db;

  public function __construct(?PDO $databaseConnection)
  {
    $this->db = $databaseConnection;
  }

  public function login(): void{
    header("Access-Control-Allow-Origin: *"); 
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Content-Type: application/json");

    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    $identifier = isset($data['identifier']) ? trim((string)$data['identifier']) : null;
    $password = isset($data['password']) ? (string)$data['password'] : null;
    $ip_address = $_SERVER['REMOTE_ADDR'];


    if(empty($identifier) || empty($password)){
      http_response_code(400);
      echo json_encode(['success' => false, 'error' => 'Please enter all fields.']);
      exit;
    }

    try{
      if(!$this->db){
        throw new Exception("Database connection is missing or unavailable.");
      }

       //CHECK RATE LIMIT FIRST
      if ($this->isRateLimited($identifier, $ip_address)) {
        http_response_code(429); // 429 Too Many Requests
        echo json_encode([
          'success' => false,
          'title' => 'Account Locked', 
          'error' => 'Too many failed login attempts. Your account is temporarily locked for 5 minutes.'
        ]);
        exit;
      }

      $sql = "SELECT id, fname, lname, username, email, password_hash, role FROM users WHERE username = ? LIMIT 1";
      $stmt = $this->db->prepare($sql);
      $stmt->execute([$identifier]);
      $user = $stmt->fetch();

      $user_id = null;
      $status = 'invalid_user';

      $log_sql = "INSERT INTO login_attempts (username, user_id, ip_address, status) VALUES (?, ?, ?, ?)";
      $log_stmt = $this->db->prepare($log_sql);

      //User does not exist
      if(!$user){
        $status = 'invalid_user';
        $user_id = null;

        $log_stmt->execute([$identifier, $user_id, $ip_address, $status]);

        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid username or password.']);
        exit;
      }

      //User exists but password is wrong
      if(!password_verify($password, $user['password_hash'])){
        $status = 'failed';
        $user_id = $user['id'];

        $log_stmt->execute([$identifier, $user_id, $ip_address, $status]);

        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid username or password.']);
        exit;
      }

      $status = 'success';
      $user_id = $user['id'];
      
      $log_stmt->execute([$identifier, $user_id, $ip_address, $status]);

      //Secured session
      if(session_status() === PHP_SESSION_NONE){
        session_start([
          'cookie_lifetime' => 86400, //1day
          'cookie_secure' => true, //Only send over HTTPS
          'cookie_httponly' => true, //Prevent JS from stealing the session cookie
          'cookie_samesite' => 'Strict' //Prevents CSRF attacks
        ]);
      }

      session_regenerate_id(true);

      $_SESSION['user_id'] = $user['id'];
      $_SESSION['username'] = $user['username'];
      $_SESSION['fname'] = $user['fname'];

      echo json_encode([
        'success' => true,
        'message' => 'Login Successful!',
        'user' => [
          'fname' => $user['fname'],
          'lname' => $user['lname']
        ]
      ]);
      exit;
    } catch(Exception $e){
      http_response_code(500);
      echo json_encode(['success' => false, 'error' => $e->getMessage()]);
      exit;
    }
  }

  private function isRateLimited(string $identifier, string $ip_address): bool {
    // Count failed attempts within the last 5 minutes
    $sql = "SELECT COUNT(*) FROM login_attempts 
            WHERE (username = ? OR ip_address = ?) 
            AND status IN ('failed', 'invalid_user') 
            AND attempted_at >= NOW() - INTERVAL 5 MINUTE";
            
    $stmt = $this->db->prepare($sql);
    $stmt->execute([$identifier, $ip_address]);
    $failed_count = (int)$stmt->fetchColumn();

    // Lock account if failures are 5 or more
    return $failed_count >= 3;
  }
}

?>