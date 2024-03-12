/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./site_front_2/flaskapp/static/js/**/*.{js,html}",
        "./site_front_2/flaskapp/templates/**/*.{js,html}",
    ],
    theme: {
        extend: {
            spacing: {
                '128': '32rem',
            },
        },
    },
    corePlugins: {
        preflight: false,
    },
    // plugins: [require("daisyui")],
    // corePlugins: {
    //   preflight: false,
    // },
}

