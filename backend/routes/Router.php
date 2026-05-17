<?php 
declare(strict_types=1);

class Router{
  private array $routes = [];
  
  //Get route handler
  public function get(string $path, array $handler): void {
    $this->routes['GET'][$path] = $handler;
  }

  //Post route handler
  public function post(string $path, array $handler): void {
    $this->routes['POST'][$path] = $handler;
  }

  //actions
  public function dispatch(string $requestedUrl, string $requestMethod, ?PDO $db){
    $path = parse_url($requestedUrl, PHP_URL_PATH);

    if ($path !== '/' && str_ends_with($path, '/')) {
        $path = rtrim($path, '/');
    }

    //Match path to register HTTP method
    if (isset($this->routes[$requestMethod][$path])) {
        [$controllerClass, $methodName] = $this->routes[$requestMethod][$path];

        $controllerInstance = new $controllerClass($db);
        
        $controllerInstance->$methodName();
        return;
    }

    header("HTTP/1.1 404 Not Found");
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        "success" => false,
        "error" => "Endpoint API Route [{$requestMethod} {$path}] not found inside backend system configurations."
    ]);
    exit;
  }
}

?>