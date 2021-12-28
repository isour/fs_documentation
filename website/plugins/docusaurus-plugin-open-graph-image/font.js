const { resolve } = require("path");
const textToSVG = require("text-to-svg");

function createFontsMapFromTemplates(templates) {
    const fonts = new Map();
    templates.forEach((template) => {
        if (!fonts.has(template.params.font)) {
            fonts.set(
                template.params.font,
                textToSVG.loadSync(resolve(template.path, template.name, template.params.font)),
            );
        }
    });
    return fonts;
}

function createSVGText(
    font,
    text,
    { fontSize = 72, fill = "white", stroke = "white" },
    widthLimit = 1000,
) {
    const attributes = { fill, stroke };
    const options = { fontSize, anchor: "top", attributes };
    // Remove all emoji from text
    let filteredText = text.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        "",
    );

    /* If font width more than widthLimit => scale font width to ~90% of widthLimit */
    if (widthLimit) {
        const { width } = font.getMetrics(filteredText, options);
        if (width > widthLimit)
            options.fontSize = Math.trunc((fontSize * 0.9) / (width / widthLimit));
        else {
            // Center text using spaces.
            const { width: spaceWidth } = font.getMetrics(" ", options);
            const availableSpacesCount = Math.trunc((widthLimit - width) / spaceWidth / 2);
            const spaces = " ".repeat(availableSpacesCount);
            filteredText = `${spaces}${filteredText}${spaces}`;
        }
    }

    return font.getSVG(filteredText, options);
}
module.exports = { createSVGText, createFontsMapFromTemplates };
