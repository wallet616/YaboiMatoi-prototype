<?php
session_start();

switch ($_POST["request"]) {
    case "login":
        if (isset($_SESSION["user"]) && trim($_SESSION["user"])!=='')
        {
            die("OK");
        }
        

        $request_key = $_POST["key"];
        $found = false;

        if ($request_key == "###/###")
        {
            $found = true;
        }

        
        if ($found)
        {
            $_SESSION["user"] = $request_key;
            die("OK");
        }
        
        die("NO_OK");






    case "logout":
        $_SESSION["user"] = "";
        die("OK");







    case "get-list":
        $repeat = "";
            foreach (glob("../audio/*.json") as $filename) {
                $myfile = fopen($filename, "r");
                $repeat .= "</>" . fread($myfile, filesize($filename));
                fclose($myfile);
            }
            die(substr($repeat, 3));





    case "get-list-admin":
        if (trim($_SESSION["user"])==='') die("NO_LOGIN");

        $repeat = "";
            foreach (glob("../audio/*.json") as $filename) {
                $name = $name = substr($filename, 9);
                $myfile = fopen($filename, "r");
                $repeat .= "</>" . $name . "<:>" . fread($myfile, filesize($filename));
                fclose($myfile);
            }
            die(substr($repeat, 3));





    case "update-song-admin":
        if (trim($_SESSION["user"])==='') die("NO_LOGIN");

        if (trim($_POST["current_file"])==='') die("NO_CURRENT_FILE");

        $file_current = $_SERVER["DOCUMENT_ROOT"] . "/audio" . "/" . $_POST["current_file"];
        if (!file_exists($file_current)) die("NO_CURRENT_FILE");

        if (trim($_POST["new_file"])==='') die("NO_NEW_FILE");

        if (trim($_POST["content"])==='') die("NO_CONTENT");


        // Deleting old one.
        unlink($file_current);

        // Creating new one.
        $new_file = fopen($_SERVER["DOCUMENT_ROOT"] . "/audio" . "/" . $_POST["new_file"], "w") or die("NO_OK");
        fwrite($new_file, $_POST["content"]);
        fclose($new_file);

        if (isset($_POST["new_song_name"]) && trim($_POST["new_song_name"])!=='')
        {
            unlink($_SERVER["DOCUMENT_ROOT"] . "/audio" . "/" . $_POST["old_song"]);

            $data = explode(',', $_POST["song"]);

            $new_file = fopen($_SERVER["DOCUMENT_ROOT"] . "/audio" . "/" . $_POST["new_song_name"], "wb") or die("NO_OK");
            fwrite($new_file, base64_decode($data[1]));
            fclose($new_file);
        }

        if (isset($_POST["image_new_name"]) && trim($_POST["image_new_name"])!=='')
        {
            unlink($_SERVER["DOCUMENT_ROOT"] . "/img" . "/" . $_POST["old_image"]);

            $data = explode(',', $_POST["image"]);

            $new_file = fopen($_SERVER["DOCUMENT_ROOT"] . "/img" . "/" . $_POST["image_new_name"], "wb") or die("NO_OK");
            fwrite($new_file, base64_decode($data[1]));
            fclose($new_file);
        }

        die("OK");





    case "create-song-admin":
        if (trim($_SESSION["user"])==='') die("NO_LOGIN");

        if (trim($_POST["new_file"])==='') die("NO_NEW_FILE");

        if (trim($_POST["content"])==='') die("NO_CONTENT");

        // Creating new one.
        $new_file = fopen($_SERVER["DOCUMENT_ROOT"] . "/audio" . "/" . $_POST["new_file"], "w") or die("NO_OK");
        fwrite($new_file, $_POST["content"]);
        fclose($new_file);


        if (isset($_POST["new_song_name"]) && trim($_POST["new_song_name"])!=='')
        {
            $data = explode(',', $_POST["song"]);

            $new_file = fopen($_SERVER["DOCUMENT_ROOT"] . "/audio" . "/" . $_POST["new_song_name"], "wb") or die("NO_OK");
            fwrite($new_file, base64_decode($data[1]));
            fclose($new_file);
        }

        if (isset($_POST["image_new_name"]) && trim($_POST["image_new_name"])!=='')
        {
            $data = explode(',', $_POST["image"]);

            $new_file = fopen($_SERVER["DOCUMENT_ROOT"] . "/img" . "/" . $_POST["image_new_name"], "wb") or die("NO_OK");
            fwrite($new_file, base64_decode($data[1]));
            fclose($new_file);
        }


        die("OK");








    case "delete-admin":
        if (trim($_SESSION["user"])==='') die("NO_LOGIN");

        if (trim($_POST["file_name"])==='') die("NO_CURRENT_FILE");


        unlink($_SERVER["DOCUMENT_ROOT"] . "/audio" . "/" . $_POST["file_name"]);
        unlink($_SERVER["DOCUMENT_ROOT"] . "/audio" . "/" . $_POST["song_name"]);
        unlink($_SERVER["DOCUMENT_ROOT"] . "/img" . "/" . $_POST["image_name"]);


        die("OK");









        
    
    default:
        die("Unknow request. Die.");
}


?>