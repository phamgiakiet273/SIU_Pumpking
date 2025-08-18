export function initS2THover() {
    //show full s2t
    document.querySelectorAll('.thumbnail').forEach(function (element) {
        var hover = element.querySelector(".description-hover");
        var text = element.querySelector(".description");
        text.textContent = text.textContent.replace(/'/g, '').replace(/,/g, '');
        hover.addEventListener('mouseenter', function () {
            text.classList.add('expanded');
            hover.style.zIndex = '-1';
        });

        hover.addEventListener('click', function () {
            text.classList.add('expanded');
            hover.style.zIndex = '-1';
        });

        text.addEventListener('mouseleave', function () {
            text.classList.remove('expanded');
            hover.style.zIndex = 'auto';
        });
        text.addEventListener('click', function () {
            text.classList.remove('expanded');
            hover.style.zIndex = 'auto';
        });
    });
}
