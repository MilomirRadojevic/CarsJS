<?php
  $method = strtoupper($_SERVER['REQUEST_METHOD']);
  $number_of_url_elements = 0;

  if(isset($_SERVER['PATH_INFO'])) {
    $url_elements = explode("/", $_SERVER['PATH_INFO']);
    $number_of_url_elements = count($url_elements) - 1;
  }

  try{
    if($method == "GET" && $number_of_url_elements == 1 && $url_elements[1] == "data") {
      header("HTTP/1.1 200 OK");
      header("Access-Control-Allow-Origin: *");
      header("Content-Type:application/json");
      echo file_get_contents("data.json");
    }
  } catch(Exception $e){
    //
  }
?>
