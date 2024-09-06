/* eslint no-underscore-dangle: ["error", { "allow": ["_emitter"] }] */
/**
 * These stunts are performed by trained professionals, don't try this at home!
 *
 * @param  {Object} block
 * @return {undefined}
 */
const splitResultIntoTwoColumnsWithLineNumbers = function generatePseudoLineNumbers(block) {
    const oldChildren = block._emitter.rootNode.children;
    const newChildren = [{
        scope: 'hack-lines',
        children: [],
    }, {
        scope: 'hack-code',
        children: oldChildren,
    }];

    const lineCount = (block.code.match(/\n/g) || '').length + 1;

    for (let i = 1; i <= lineCount; i += 1) {
        newChildren[0].children.push(`${i}\n`);
    }

    // Trims newlines from the end of the columns.
    // Iterates backwards until the line is not plain string, then exists:
    for (let i = oldChildren.length - 1; i > oldChildren.length - 5; i -= 1) {
        const lineContents = oldChildren[i];

        if (typeof lineContents === 'string' && lineContents.match(/^[\r|\n]+$/)) {
            // Count of linebreaks in the string:
            const lineBreaks = lineContents.length;

            // Remove linebreaks from the end of the left column:
            newChildren[0].children.splice(lineBreaks * -1);

            // Since this line is considered a single child, we remove ONE last child
            // from the right column:
            newChildren[1].children.splice(-1);
        } else {
            break;
        }
    }

    /* eslint-disable-next-line no-param-reassign */
    block._emitter.rootNode.children = newChildren;
};

/**
 * Resolves to hl.js instance.
 * @type {Promise<Object>}
 */
let hljsPromise = undefined;

/**
 * We need to load core module just once, because we can't check the plugin list.
 * @return {Promise<Object>}
 */
const loadHljsCore = async function loadHighlightJsCoreModuleScript() {
    if (!hljsPromise) {
        hljsPromise = import('highlight.js/lib/core').then((esm) => {
            esm.default.addPlugin({
                'after:highlight': splitResultIntoTwoColumnsWithLineNumbers,
            });

            return esm.default;
        });
    }

    return hljsPromise;
};

/**
 * @param  {String} lang
 * @return {Promise<Object>}
 */
const loadHljsGrammar = async function loadHighlighJsGrammarScript(lang) {
    return import(`highlightjs-func/src/languages/${lang}.js`).then(esm => esm.default);
};

/**
 * @param  {String} lang
 * @return {Promise<Object>}  HighlightJS instance
 */
const loadLibraries = async function loadExternalDependencyScripts(lang) {
    const [hljs, grammar] = await Promise.all([
        loadHljsCore(),
        loadHljsGrammar(lang),
    ]);

    hljs.registerLanguage(lang, grammar);
    return hljs;
};

/**
 * @param  {String} value
 * @param  {String} language
 * @return {Promise<String>}
 */
export const highlight = async function loadAllDependenciesAndReturnHighlightedCode(value, language = 'func') {
    return loadLibraries(language)
        .then(hljs => hljs.highlight(value, { language })._emitter.toHTML())
        .catch(() => value);
};
