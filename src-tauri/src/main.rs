// Tauri 入口文件
// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    writer_cat_lib::run();
}
