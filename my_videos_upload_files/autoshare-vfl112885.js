/**
 * For scope reasons, wrap this in an anonymous function call.
 */
(function() {

	var AutoShare = function(session_param, root_url, connection_handler, failure_handler, service_info, autoshare_all_actions, show_autoshare_upgrade) {
		this.session_param_ = session_param;
		this.root_url_ = root_url;
		this.connection_handler_ = connection_handler;
		this.failure_handler_ = failure_handler;
		this.service_info_ = service_info;
		this.autoshare_all_actions_ = autoshare_all_actions;
		this.show_autoshare_upgrade = show_autoshare_upgrade;
		this.popup_ = null;
	}

	AutoShare.prototype.processOnLoadDuties = function() {
		if (this.service_info_) {
			this.processServiceInfoJson(this.service_info_);
			this.service_info_ = null;
		}
		this.displayTextBasedOnFeatureVersion();
		if (this.show_autoshare_upgrade) {
			showDiv('autoshare-upgrade');
		}
	}

	AutoShare.prototype.processServiceInfoJson = function(json_response) {
		if (this.connection_handler_) {
			for (service in json_response) {
				info = json_response[service];
				this.connection_handler_(service, info.connected, info.connected_as);

				if (service == 'facebook' && info.connected) {
					window.prePerformFbConnectAction(4); // Dirty, dirty, dirty.
				}
			}
		}
	}

	AutoShare.prototype.displayTextBasedOnFeatureVersion = function () {
		if (this.autoshare_all_actions_) {
			showDiv('autoshare-intro-all');
			hideDiv('autoshare-intro-upload');
			showDiv('autoshare-desc-all');
			hideDiv('autoshare-desc-upload');
			showDiv('autoshare-help-all');
			hideDiv('autoshare-help-upload');
		} else {
			hideDiv('autoshare-intro-all');
			showDiv('autoshare-intro-upload');
			hideDiv('autoshare-desc-all');
			showDiv('autoshare-desc-upload');
			hideDiv('autoshare-help-all');
			showDiv('autoshare-help-upload');
		}
	}

	AutoShare.prototype.connectService = function(service) {
		if (this.popup_) {
			try {
				this.popup_.close();
			} catch (e) {
				this.popup_ = null;
			}
		}

		if (service == 'facebook') {
			window.doConnect(); // Dirty, dirty, dirty.
		} else if (service == 'reader') {
			// This URL is fake - reader should really go through the FBS flow but this is all
			// we need to trick the AJAX handler into adding it.
			this.connectServiceDone('http://www.youtube.com/autoshare?service=reader', null); // Dirty, dirty, dirty.
		} else {
			var popupUrl = '/autoshare?action_popup_auth=1&service=' + service;
			this.popup_ = openPopup(popupUrl, '', 430, 860, false);
		}
	}

	AutoShare.prototype.connectServiceDone = function(returnUrl, do_cleanup) {
		var onComplete = function(json_response) {
			if (do_cleanup) {
				do_cleanup();
			}
			this.processServiceInfoJson(json_response);
		}.bind(this);

		var onException = function() {
			if (do_cleanup) {
				do_cleanup();
			}
			if (this.failure_handler_) {
				this.failure_handler_();
			}
		}.bind(this);

		var data = new Array();
		data.push({ name: 'action_ajax_connect_service', value: 1 });
		data.push({ name: 'return_url', value: returnUrl });
		ajaxRequest('/autoshare?ajax_connect_service',
			{ postBody: urlEncodeDict(data) + "&" + this.session_param_,
			onComplete: onComplete, onException: onException, json: true });
	}

	AutoShare.prototype.disconnectService = function(service) {
		if (service == 'facebook') {
			window.prePerformFbConnectAction(2); // Dirty, dirty, dirty.
		} else {
			var onComplete = function() {
				if (this.connection_handler_) {
					this.connection_handler_(service, false);
				}
			}.bind(this);

			var onException = function() {
				if (this.failure_handler_) {
					this.failure_handler_();
				}
			}.bind(this);

			var data = new Array();
			data.push({ name: 'action_ajax_disconnect_service', value: 1 });
			data.push({ name: 'service', value: service });

			ajaxRequest('/autoshare?ajax_disconnect_service',
				{ postBody: urlEncodeDict(data) + "&" + this.session_param_,
				onComplete: onComplete, onException: onException });
		}
	}

	AutoShare.prototype.upgradeToAllActions = function() {
		var onComplete = function() {
			hideDiv('autoshare-upgrade');
			this.autoshare_all_actions_ = true;
			this.displayTextBasedOnFeatureVersion();
		}.bind(this);

		var onException = function() {
			if (this.failure_handler_) {
				this.failure_handler_();
			}
		}.bind(this);
		
		var data = new Array();
		data.push({ name: 'action_ajax_upgrade_to_all_actions', value: 1});
		ajaxRequest('/autoshare?ajax_upgrade_to_all_actions',
			{ postBody: urlEncodeDict(data) + "&" + this.session_param_,
			onComplete: onComplete, onException: onException });
	}

	window.AutoShare = AutoShare;

})();

