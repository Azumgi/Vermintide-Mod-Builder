const watcher = require('glob-watcher');
const cl = require('../cl');
const config = require('../config');

const modTools = require('../mod_tools');
const buildMod = require('../builder');

module.exports = async function watchTask() {

    let exitCode = 0;

    let { modNames, verbose, shouldRemoveTemp, modId, makeWorkshopCopy, ignoreBuildErrors } = await cl.getBuildParams();

    if (modNames.length === 0) {
        console.log(`No mods to watch`);
        return { exitCode, finished: true };
    }

    let toolsDir = await modTools.getModToolsDir().catch((error) => {
        console.error(error);
        exitCode = 1;
    });

    if (toolsDir) {
        console.log();

        await modTools.forEachMod(
            modNames,
            makeWorkshopCopy,
            (modName, modDir) => {
                console.log(`Watching ${modName}...`);

                let src = [
                    modDir,
                    '!' + config.modsDir + '/' + modName + '/*.tmp',
                    '!' + config.modsDir + '/' + modName + '/' + config.bundleDir + '/*'
                ];

                watcher(src, async (callback) => {
                    try {
                        await buildMod(toolsDir, modName, shouldRemoveTemp, makeWorkshopCopy, verbose, ignoreBuildErrors, modId);
                    }
                    catch (error) {
                        console.error(error);
                        exitCode = 1;
                    };
                    callback();
                });
            },
            (error) => {
                console.error(error);
                exitCode = 1;
            }
        );
    }

    return { exitCode, finished: false };
};
