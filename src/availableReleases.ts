import * as vscode from 'vscode';
import { parseYamlInNameOnly } from './utils';

export class ReleaseProvider implements vscode.TreeDataProvider<TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | void> = new vscode.EventEmitter<TreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceName: string | undefined, private workspaceRoot: string | undefined) {
	}

	refreshData() : void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
		return element;
	}

    getChildren(element?: TreeItem|undefined): vscode.ProviderResult<TreeItem[]> {
		if (element === undefined) {
			return Promise.resolve(this.getDependencyData(this.workspaceName, this.workspaceRoot));
		  }
		  return element.children;
	}

	private async getDependencyData(workspaceName?: string, workspaceRoot?: string): Promise<TreeItem[]> {

		if(!workspaceRoot || !workspaceName) {
			return [];
		}
		const releaseData = Array() as TreeItem[];
		const depFiles = await vscode.workspace.findFiles('**/secureboot_binaries_ext_dep.yaml');
		if (depFiles === null || depFiles === undefined || depFiles.length === 0) {
			vscode.window.showInformationMessage('Workspace has no secureboot_binaries_ext_dep.yaml files');
			return [];
		}

		for (const depFile of depFiles) {
			var fileNameWithoutRoot = depFile.path.split(workspaceName!)[1];
			const availableUpdates = Array() as TreeItem[];
			const updateData = await parseYamlInNameOnly(depFile);
			if(updateData) {
				availableUpdates.push(new TreeItem(`Release ${updateData} Available`, undefined, depFile, updateData, 'treeitem'));
			}

			releaseData.push(new TreeItem(fileNameWithoutRoot, availableUpdates, depFile));
		}

		return [
			new TreeItem(workspaceName, [...releaseData])
		];
	}
}


export class TreeItem extends vscode.TreeItem {
	children: TreeItem[]|undefined;
	fullFilePath: vscode.Uri|undefined;
	availableUpdate: string|undefined;

    constructor(
        public readonly label: string,
		children?: TreeItem[],
		fullFilePath?: vscode.Uri,
		availableUpdate?: string,
		contextValue?: string,
    ) {
		const collapsibleState = (children === undefined) ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded;
        super(label, collapsibleState);

		this.fullFilePath = fullFilePath;
		this.children = children;
		this.availableUpdate = availableUpdate;

		if(contextValue) {
			this.contextValue = contextValue;
		}
	}
}