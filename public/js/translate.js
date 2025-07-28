// todo
let translate = (element, new_text) => {
    let current = element.innerText;
    let l = max(current.length, new_text.length);
    current.padEnd(l, " ");
    new_text.padEnd(l, " ");

    let indices = [...Array(l).keys()];
    while (indices.length > 0) {
        let next = Math.floor(Math.random() * (indices.length + 1));

    }
}
