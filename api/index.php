<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Request-With");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

include_once __DIR__ . "/database.php";
$db = new Connection();

//Converts request link to array
if (isset($_REQUEST['request'])) {
    $request = explode('/', $_REQUEST['request']);
} else {
    echo json_encode(array('message' => 'failed request'));
    http_response_code(404);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        switch ($request[0]) {
            case 'getNotes':

                $data = [];
                $errmsg = "";
                $code = 0;
        
                try {
                    if ($result = $db->connect()->query('SELECT * FROM `notes`')->fetchAll()) {
                        foreach ($result as $record) {
                            array_push($data, $record);
                        }
                        $code = 200;
                        $result = null;
                        echo json_encode(array("code" => $code, "data" => $data));
                    } else {
                        $errmsg = "No data found";
                        $code = 404;
                    }
                } catch (\PDOException $e) {
                    $errmsg = $e->getMessage();
                    $code = 403;
                    echo json_encode(array("code" => $code, "errmsg" => $errmsg, "data" => $data));
                }
                break;
                
            default:
                http_response_code(404);
                break;
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        echo $data;
        switch ($request[0]) {
            
            case 'addMessage':
                $sql = "INSERT INTO `notes` (message) VALUES (:message)";
                $stmt = $db->connect()->prepare($sql);
                $errmsg = "";
                $code = 0;
        
                try {
                    if ($stmt->execute([':message' => $data->message])) {
                        $code = 200;
                        echo json_encode(array("code" => $code, "msg" => 'Successful Query.'));
                    } else {
                        $errmsg = "No data found";
                        $code = 404;
                    }
                } catch (\PDOException $e) {
                    $errmsg = $e->getMessage();
                    $code = 403;
                    echo json_encode(array("code" => $code, "errmsg" => $errmsg));
                }
                break;
            default:
                http_response_code(403);
                break;
        }
        break;



    case 'DELETE':
        $id = $_GET['id'];
        echo $data;
        switch ($request[0]) {
            
            case 'deleteMessage':
                $sql = "DELETE FROM `notes` WHERE message_ID = :message";
                $stmt = $db->connect()->prepare($sql);
                $errmsg = "";
                $code = 0;
        
                try {
                    if ($stmt->execute([':message' => $id])) {
                        $code = 200;
                        echo json_encode(array("code" => $code, "msg" => 'Successful Query.'));
                    } else {
                        $errmsg = "No data found";
                        $code = 404;
                    }
                } catch (\PDOException $e) {
                    $errmsg = $e->getMessage();
                    $code = 403;
                    echo json_encode(array("code" => $code, "errmsg" => $errmsg));
                }
                break;
            default:
                http_response_code(403);
                break;
        }
        break;

    default:
        http_response_code(404);
        break;
}

?>