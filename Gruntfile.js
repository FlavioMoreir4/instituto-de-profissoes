module.exports = function (grunt) {
    grunt.initConfig({
        'create-windows-installer': {
            ia32: {
                appDirectory: './out/Instituto de Profissões-win32-ia32',
                outputDirectory: './out/install',
                name: 'Instituto-de-Profissoes',
                description: 'Aula Interativa',
                authors: 'Instituto de Profissoes',
                exe: 'Instituto de Profissões.exe'
            }
        }
    });

    grunt.loadNpmTasks('grunt-electron-installer');
};