<!-- <h2 class="nav-tab-wrapper">
    <span class="nav-tab nav-tab-active">View</span>
    <a href="<?php echo $slug; ?>&amp;tab=modify" target="" class="nav-tab">Modify</a>
    <a href="<?php echo $slug; ?>&amp;tab=add" target="" class="nav-tab">Add</a>
</h2> -->

<?php
foreach($posts as $post) {
    echo '<h1>';
    
    echo $post['post_title'];
    
    echo '</h1>';
}
?>