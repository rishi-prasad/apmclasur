function marathiOnly($field) {
    const marathiUnicodeRange = /[\u0900-\u097f]/;

    $field.bind("keydown", (event) => {
        let key = event.which;
        if (key === 8 || key === 0 || key === 32) {
            return true;
        }

        let str = String.fromCharCode(key);

        if (marathiUnicodeRange.test(str)) {
            return true;
        }

        return false;
    });
}

function restrictCopy($field) {
    $field.bind("copy paste", (e) => {
        return false;
    });
}

jQuery(document).ready(() => {
    marathiOnly($('#name'));
    marathiOnly($('#village'));
    marathiOnly($('#taluka'));
    marathiOnly($('#district'));
    marathiOnly($('#bankBranch'));
    // restrictCopy($('#name'));
    // restrictCopy($('#village'));
    // restrictCopy($('#taluka'));
    // restrictCopy($('#district'));
    // restrictCopy($('#bankBranch'));
});