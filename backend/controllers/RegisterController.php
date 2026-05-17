<?php  
class RegisterController {
  private ?PDO $db;

  public function __construct(?PDO $databaseConnection)
  {
     $this->db = $databaseConnection;
  }

  public function register(): void {
    header("Access-Control-Allow-Origin: *"); 
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Content-Type: application/json");

    $json_data = file_get_contents('php://input');

    $data = json_decode($json_data, true);

    $fname = isset($data['fname']) ? trim((string)$data['fname']) : null;
    $lname = isset($data['lname']) ? trim((string)$data['lname']) : null;
    $email = isset($data['email']) ? trim((string)$data['email']) : null;
    $username = isset($data['username']) ? trim((string)$data['username']) : null;
    $password = isset($data['password']) ? trim((string)$data['password']) : null;

    if(empty($fname) || empty($lname) || empty($email) || empty($username) || empty($password)){
      echo json_encode(['success' => false, 'error' => 'Please fill out all fields.']);
      exit;
    }

    //Sanitize and validate name
    if(empty($fname) || strlen($fname) < 2){
      echo json_encode(['success' => false, 'error' => 'First name must be at least 2 characters.']);
      exit;
    }

    if(empty($lname) || strlen($lname) < 2){
      echo json_encode(['success' => false, 'error' => 'Last name must be at least 2 characters.']);
      exit;
    }

    // Validate Email
    if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
      echo json_encode(['success' => false, 'error' => 'Please enter a valid email address.']);
      exit;
    }

    // Strong Password Validation
    $passwordRegex = '/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/';
    if(!preg_match($passwordRegex, $password)){
      echo json_encode(['success' => false, 'error' => 'Password must be minimum of 8 character with number & special character']);
      exit;
    }


    
    try{
      if (!$this->db) {
          throw new Exception("Database connection is missing or unavailable.");
      }

      $checkSQL = "SELECT id FROM users WHERE email = ?  OR username = ? LIMIT 1";
      $checkStmt = $this->db->prepare($checkSQL);
      $checkStmt->execute([$email, $username]);

      if($checkStmt->fetch()){
        http_response_code(409);
        echo json_encode(['success' => false, 'error' => 'Account already exist.']);
        exit;
      }

      $hashed_password = password_hash($password, PASSWORD_DEFAULT);

      $insertSQL = "INSERT INTO users (fname, lname, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)";
      $insertStmt = $this->db->prepare($insertSQL);
      $insertStmt->execute([$fname, $lname, $username, $email, $hashed_password, 'visitor']);

      //Success Created
      http_response_code(201);
      echo json_encode(['success' => true, 'message' => 'Registration completed successfully!']);
      exit;


    } catch (Exception $e){
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'error' => "Controller Caught Error: " . $e->getMessage() // This will show the real database issue
        ]);
        exit;
    }
  }
}

?>