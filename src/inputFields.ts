import { CompanionInputFieldDropdown, CompanionInputFieldNumber } from "@companion-module/base"

export const modeToggle: CompanionInputFieldDropdown = {
	id:'mode',
	type:'dropdown',
	label:'Mode',
	default:'toggle',
	choices:[
		{label:'Toggle',id:'toggle'},
		{label:'On',id:'on'},
		{label:'Off',id:'off'}
	]

}

export const indexInput : CompanionInputFieldNumber = {
    id: 'index',
    type: 'number',
    label: 'Pl index',
    default: 1,
    min: 1,
    max: 200,
}