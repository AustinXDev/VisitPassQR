<<<<<<< HEAD
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


    echo json_encode(['success' => true, 'message' => 'Successfully Created an account.']);
    exit;


    
    try{

    } catch (Exception $e){
      http_response_code(400);
      echo json_encode(['success' => false, 'message' => $e->getMessage()]);
      exit;
    }
  }
}

=======
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


    echo json_encode(['success' => true, 'message' => 'Successfully Created an account.']);
    exit;


    
    try{

    } catch (Exception $e){
      http_response_code(400);
      echo json_encode(['success' => false, 'message' => $e->getMessage()]);
      exit;
    }
  }
}

>>>>>>> 20af428 (Fixed line endings and staged frontend files)
?>