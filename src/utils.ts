import axios from "axios";
import * as vscode from 'vscode';

var semver = require('semver'); 

export function compareSemVer(oldVersion: any, newVersion: any): boolean {
    const newRelease = semver.gt(semver.clean(newVersion), semver.clean(oldVersion));
    return newRelease;
}

export function replaceVersionString(releaseString:string, newReleaseTag: string): string {
    const regex = /v[0-9]+.[0-9]+.[0-9]+/gm;

    var newVersionString = releaseString.replace(regex, newReleaseTag); 
    console.log(newVersionString);
    return newVersionString;
}

export async function updateReleaseData(filePath: vscode.Uri|undefined, newRelease:string|undefined) {
    if(!filePath) {
        vscode.window.showErrorMessage('File Path was undefined, could not update dependency');
        return;
    }

    if(!newRelease) { 
        vscode.window.showErrorMessage('Release version was undefined, could not update dependency');
        return;
    }

    const yamlInNameOnly = await vscode.workspace.openTextDocument(filePath);
    const fileContent = yamlInNameOnly.getText();

    const updatedContent = replaceVersionString(fileContent, newRelease);

    const workspaceEdit = new vscode.WorkspaceEdit();
    const textRange = new vscode.Range(yamlInNameOnly.lineAt(0).range.start, yamlInNameOnly.lineAt(yamlInNameOnly.lineCount - 1).range.end);
    const newText = new vscode.TextEdit(textRange, updatedContent);
    const edits = [newText];
    workspaceEdit.set(filePath, edits);

    vscode.workspace.applyEdit(workspaceEdit);
}

export async function getRepoReleases(org: string, repo:string): Promise<any> {
    const releaseUrl = `https://api.github.com/repos/${org}/${repo}/releases`;
    const repoRelease = (await axios.get(releaseUrl)).data[0];
    return repoRelease;
}

export async function parseYamlInNameOnly(filePath: vscode.Uri): Promise<any> {
    const yamlInNameOnly = await vscode.workspace.openTextDocument(filePath);
    const fileContent = yamlInNameOnly.getText();
    const splitContent = fileContent.split("##")[2];
    const assetObject = JSON.parse(splitContent);
    const repoSource = assetObject.source.replace("https://", "").replace("http://", "").split('/');
    const version = assetObject.version;

    const org = repoSource[1];
    const repoName = repoSource[2];

    const latestRelease = await getRepoReleases(org, repoName);
    
    const newRelease = compareSemVer(version, latestRelease.tag_name);

    if(newRelease) {
        return latestRelease.tag_name;
    }
    else {
        return undefined;
    }
}