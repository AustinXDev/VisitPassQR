<?php 
declare(strict_types=1);

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/routes/Router.php';
require_once __DIR__ . '/controllers/RegisterController.php';

//Initialize Database
$database = new Database();
$db = $database->getConnection();

//Initialize Router
$router  = new Router();

$router->post('/VisitPassQR/backend/index.php/api/register', [RegisterController::class, 'register']);

$requestedUrl = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

$router->dispatch($requestedUrl, $requestMethod, $db);
?>