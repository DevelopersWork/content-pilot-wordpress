<?php
/**
 * @package DWContentPilot
 */
namespace DW\ContentPilot\Lib;

use DW\ContentPilot\Core\Store;

class API
{

    public $store;

    private $__FILE__;

    public function __construct()
    {
        $this -> store = new Store();

        $this -> store -> set('_ERROR', false);
        $this -> store -> set('_AUTH_KEY', wp_get_session_token());

        $categories = array('name' => '', 'value' => array());
        $this -> store -> set('categories', $categories);
    }

    protected function createCategories()
    {
        $this -> store -> debug(get_class($this).':createCategories()', '{STARTED}');
        $categories = [];

        $_categories = $this -> store -> get('categories');

        if ($_categories['name'] == '') {
            $this -> store -> set('_CATEGORY_ERROR', 'parent');
            return false;
        }

        $parent = wp_create_category(strtoupper(DWContetPilotPrefix) .'_'. $_categories['name']);

        if (!$parent) {
            $this -> store -> set('_CATEGORY_ERROR', 'parent');
            return false;
        } else {
            $categories[$_categories['name']] = $parent;
        }

        $category_error = array();
        foreach ($_categories['value'] as $category) {
            $child = wp_create_category(strtoupper(DWContetPilotPrefix) .'_'. $category, $parent);

            if ($child) {
                $categories[$category] = $child;
            } else {
                array_push($category_error, $category);
            }
        }

        if($category_error) $this -> store -> set('_CATEGORY_ERROR', $category_error);

        $this -> store -> set('_categories', $categories);

        return true;
    }

    protected function createPostType()
    {
        $this -> store -> debug(get_class($this).':createPostType()', '{STARTED}');

        $_post_type = $this -> store -> get('post_type');
        $name = $this -> store -> get('name');

        if (!$_post_type) {
            $this -> store -> set('_POST_TYPE_ERROR', 'post_type');
            return false;
        }

        $post_type = register_post_type(strtoupper(DWContetPilotPrefix) .'_'. $name, $_post_type);

        if(!$post_type) {
            $this -> store -> set('_POST_TYPE_ERROR', $_post_type);
            return false;
        }

        $this -> store -> set('_post_type', $post_type);

        return true;
    }

    protected function parseRequest(string $method = '')
    {
        $this -> store -> debug(get_class($this).':requestGET()', '{STARTED}');

        $slug = explode('?', $_SERVER['REQUEST_URI'])[0];
        $this -> store -> set('_REQUEST_URI', $slug);

        if(strtolower($method) == 'get') {
            $this -> store -> set('_PARAMS', $_GET);
        } else if(strtolower($method) == 'post') {
            $this -> store -> set('_PARAMS', $_POST);
        } else {
            $this -> store -> set('_PARAMS', $_REQUEST);
        }
        
    }

    public function getURI(array $params = array())
    {
        $slug = $this -> store -> get('_REQUEST_URI') . '?';

        $_params = $this -> store -> get('_PARAMS');

        $keys = array('page');

        foreach ($keys as $key) {
            if(isset($_params[$key])) 
                $slug .= $key. '=' . $_params[$key] . '&';
        }

        if($params) 
            foreach($params as $key => $value) {
                $slug .= $key. '=' . $value . '&';
            }

        return $slug;
    }
}
