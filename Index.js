const Navigation = {
    navigateTo: function(url) {
        window.location.href = url;
    }
};

const App = {
    initializeButtons: function() {
        const buttons = document.querySelectorAll('[data-route]');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const route = e.target.getAttribute('data-route');
                Navigation.navigateTo(route);
            });
        });
    }
}

window.navigateTo = Navigation.navigateTo;