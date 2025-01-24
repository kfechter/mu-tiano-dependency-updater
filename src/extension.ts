// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { updateReleaseData } from './utils';
import { ReleaseProvider, TreeItem } from './availableReleases';

const dismissAction = "Dismiss";
const ignoreAction = "Ignore This Release";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "project-release-notifier" is now active!');
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;


	const releaseUpdatesProvider = new ReleaseProvider(vscode.workspace.name, rootPath);
	const treeDataProvider = vscode.window.registerTreeDataProvider('dependencyUpdates', releaseUpdatesProvider);
	const refreshCommand = vscode.commands.registerCommand('dependencyUpdates.refresh', () => releaseUpdatesProvider.refreshData());
	const updateCommand = vscode.commands.registerCommand('dependencyUpdates.updateDependency', (node: TreeItem) => updateReleaseData(node.fullFilePath, node.availableUpdate));


	context.subscriptions.push(treeDataProvider);
	context.subscriptions.push(refreshCommand);
	context.subscriptions.push(updateCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
