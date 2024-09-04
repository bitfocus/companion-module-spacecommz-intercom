import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import express = require('express');
import cors = require('cors');
import {Server} from "http";
import * as socketio from "socket.io";
import { UpdatePresetDefinitions } from './preset.js'
	

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	private app:any;
    private http:Server;
	io:socketio.Server;
	pls:any= []
	mute:boolean = false
	constructor(internal: unknown) {
		super(internal)
		
		this.app = express();
        this.http = new Server(this.app);
        this.io = new socketio.Server(this.http,{
			cors:{
				origin:"*"
			}
		
		});
        this.app.use(cors());
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.io.on("connection",(socket)=>{
			this.updateStatus(InstanceStatus.Ok)
			socket.on("disconnect",()=>{
				console.log("A user disconnected")
				this.updateStatus(InstanceStatus.Connecting,"Waiting for a connection")
			})
			socket.on("updatePls",(msg)=>{
				this.pls = msg
				this.updateVariableDefinitions()
				this.updatePreset()
				this.checkFeedbacks('soloState',"talkState","listenState")
			})

			socket.on("updateMute",(msg)=>{
				console.log("mute updated")
				this.mute = msg
				this.checkFeedbacks('muteState')
			})
		})
		this.http.listen(this.config.port,()=>{ console.log("PanelServer Started on port "+this.config.port)});
		this.updateStatus(InstanceStatus.Connecting,"Waiting for a connection")

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePreset() // export presets
	}
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
	updatePreset(): void {
		UpdatePresetDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
