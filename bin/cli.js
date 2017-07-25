#! /usr/bin/env node
var shell = require('shelljs');
var p = require('path');
var fs = require('fs');

var args = process.argv.slice(2);

// Default configuration to generate files
var generatorConfig = {
  c: {
    files: [
      {
        suffix: 'component',
        ext: 'ts',
        template: p.join(__dirname, '../templates/component/component.ts')
      },
      {
        suffix: 'component',
        ext: 'html',
        template: p.join(__dirname, '../templates/component/component.html')
      },
      {
        suffix: 'component',
        ext: 'scss',
        template: p.join(__dirname, '../templates/component/component.scss')
      }
    ]
  }
};

// Generate directory and return path to it
function genDir(path) {
  var dirPath = p.join(shell.pwd().stdout, path);
  shell.echo("Creating directory at path - " + dirPath);
  shell.mkdir('-p', dirPath);

  return dirPath;
}

// Get name for the files to be created
function getFileName(path) {
  var pathComps = path.split("/");

  return pathComps[pathComps.length - 1]
    .replace(/(-)/g, "_");
}

// Get name for the generated element
function getName(path) {
  var pathComps = path.split("/");

  return pathComps[pathComps.length - 1]
    .replace(/[-_](.)/g, function(match, p1) {
      return p1.toUpperCase();
    }).replace(/(.)/, function(match, p1) {
      return p1.toUpperCase();
    });
}

// Get selector name
function getSelectorName(path) {
  var pathComps = path.split("/");

  return pathComps[pathComps.length - 1];
}

// Get full path for the file
function getFilePath(option, path) {
  var fileName = getFileName(path);

  return p.join(shell.pwd().stdout, path, fileName + '.' + option.suffix + '.' + option.ext);
}

function generateFiles(path, config) {
  var elementName = getName(path);
  var selectorName = getSelectorName(path);
  var fileName = getFileName(path);

  genDir(path);

  config.files.forEach(function (option) {
    var parsedString = getParsedStringFromTemplate(
      elementName,
      selectorName,
      fileName,
      option.template);

    var filePath = getFilePath(option, path);
    shell.echo("Creating file " + filePath);
    shell.echo(parsedString).to(filePath);
  });
}

function getParsedStringFromTemplate(element, selector, fileName, templatePath, callback) {
  shell.echo("Fetching template from " + templatePath);
  return fs.readFileSync(templatePath, 'utf-8')
    .replace(/{{selector}}/g, selector)
    .replace(/{{element}}/g, element)
    .replace(/{{fileName}}/g, fileName);
}

generateFiles(args[1], generatorConfig[args[0]]);
