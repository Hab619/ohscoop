<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function ohscoop_register_jump_button() {
    register_block_type( 'ohscoop/jump-to-recipe', [
        'editor_script'   => 'ohscoop-block-editor',
        'style'           => 'ohscoop-frontend-style',
        'render_callback' => 'ohscoop_render_jump_button',
        'attributes'      => [
            'label'       => [ 'type' => 'string', 'default' => '⬇ Jump to Recipe' ],
            'accentColor' => [ 'type' => 'string', 'default' => '#7c3aed' ],
        ],
    ]);
}
add_action( 'init', 'ohscoop_register_jump_button' );

function ohscoop_render_jump_button( $a ) {
    $label  = esc_html( $a['label'] ?? '⬇ Jump to Recipe' );
    $accent = esc_attr( $a['accentColor'] ?? '#7c3aed' );
    return '<div class="ohscoop-jump-wrap">
        <a href="#ohscoop-recipe" class="ohscoop-jump-btn" style="background:' . $accent . '">' . $label . '</a>
    </div>';
}
