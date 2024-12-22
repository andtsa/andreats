// Track the sequence of keys pressed
let keySequence = [];
const targetSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown']; 

document.addEventListener('keydown', (event) => {
    keySequence.push(event.key);
    
    // Check if the sequence matches
    if (keySequence.slice(-targetSequence.length).join(',') === targetSequence.join(',')) {
        addCSSRule('.square', `
            -webkit-animation: Rotate 9s ease infinite;
            -moz-animation: Rotate 9s ease infinite;
            -o-animation: Rotate 9s ease infinite;
            animation: Rotate 9s ease infinite;
        `);
        console.log(`you've escaped, congrats.`);
    }
});

// Function to add a new CSS rule dynamically
function addCSSRule(selector, rule) {
    let stylesheet = document.styleSheets[0];
    
    // If no stylesheet exists, create one
    if (!stylesheet) {
        const style = document.createElement('style');
        document.head.appendChild(style);
        stylesheet = style.sheet;
    }

    // Add the rule to the stylesheet
    stylesheet.insertRule(`${selector} { ${rule} }`, stylesheet.cssRules.length);
}

