// helpers.js - Non-Module Version
// ========================

// Tạo object chứa tất cả helper functions
const Helpers = {
    /**
     * Fetch JSON data từ thư mục data
     * @param {string} filename - Tên file không cần .json
     * @returns {Promise<object|null>} Dữ liệu JSON hoặc null nếu có lỗi
     */
    async getJsonData(filename) {
        try {
            const response = await fetch(`../../data/${filename}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${filename}.json:`, error);
            return null;
        }
    },

    /**
     * Tạo DOM element với các thuộc tính tùy chọn
     * @param {string} tag - Tên thẻ HTML
     * @param {object} [options] - Các thuộc tính cần gán
     * @returns {HTMLElement} Element đã được tạo
     */
    createElement(tag, options = {}) {
        const element = document.createElement(tag);
        Object.entries(options).forEach(([key, value]) => {
            element[key] = value;
        });
        return element;
    }
};