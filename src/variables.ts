import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	let definitions : CompanionVariableDefinition[]= []
	// @ts-ignore
	let values :CompanionVariableValues = []
	if(self.pls.length != 0){
	self.pls.forEach((_pl:any, index:any) => {
		definitions.push({
			variableId: "pl_"+(index+1)+"_name",
			name: "pl_"+(index+1)+"_name"
		})
		values["pl_"+(index+1)+"_name"] = _pl.name
	})
	self.setVariableDefinitions(definitions)
	self.setVariableValues(values)
}
}
