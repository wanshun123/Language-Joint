import Ember from 'ember';
import Message from '../models/message';
import SocketIo1xConnection from '../utils/SocketIo1xConnection';
import config from '../config/environment';

const {
  inject: { service },
  get,
  Logger: { debug, error }
} = Ember;

export default Ember.Mixin.create({

  store: service(),

  currentUser: service(),

  tour: service(),

  connectionReady: false,

  isDataChannelOpened: false,

  remoteSpeechLang: Ember.computed.oneWay('currentUser.remoteSpeechLanguage'),

  stream: null,

  status: null,

  messages: [],

  participants: [],

  localTranslationLanguage: Ember.computed('currentUser.localSpeechLanguage', function () {
    return this.get('currentUser.localSpeechLanguage').split('-')[0];
  }),

  remoteTranslationLanguage: Ember.computed('remoteSpeechLang', function () {
    return this.get('remoteSpeechLang').split('-')[0];
  }),

  webrtc: Ember.computed('', function () {
    return new window.SimpleWebRTC({
      localVideoEl: '',
      remoteVideosEl: '',
      autoRequestMedia: true,
      debug: false,
      media: { audio: true, video: false },
      connection: new SocketIo1xConnection({
        url: config.SIGNALMASTER.HOST,
        port: config.SIGNALMASTER.PORT,
        socketio: { 'force new connection': config.SIGNALMASTER.FORCE_CONNECTION },
      })
    });
  }),

  setupWebrtc() {
    this._super(...arguments);
    let webrtc = this.get('webrtc');
    webrtc.on('connectionReady', () => this.set('connectionReady', true));
    webrtc.on('error', this.webrtcOnError.bind(this));
    webrtc.on('channelOpen', this.webrtcOnChannelOpen.bind(this));
    webrtc.on('channelClose', this.webrtcOnChannelClose.bind(this));
    webrtc.on('channelError', this.webrtcOnChannelError.bind(this));
    webrtc.on('channelMessage', this.webrtcMessageRecieved.bind(this));
    webrtc.on('createdPeer', this.createdPeer.bind(this));
    webrtc.on('readyToCall', this.showTour.bind(this));
    this.scheduleVideoJoin();
  },

  /**
  * This is triggered when RTC channel encounters an error
  *
  * @method webrtcOnError
  * @param error @type {Object}
  */
  webrtcOnError(error) {
    switch (error) {
      case 'full':
        error('You cannot join this room, because it is full');
        break;
      default:
        error(error);
    }
  },

  /**
  * This is triggered when RTC channel gets open
  *
  * @method webrtcOnChannelOpen
  * @param channel @type {Object}
  */
  webrtcOnChannelOpen(channel) {
    if (channel.label === 'simplewebrtc') {
      this.setValues({isDataChannelOpened: true});
      this.sendLanguage(get(this, 'currentUser.localSpeechLanguage'));
      debug('Data channel opened.');
    }
  },

  /**
  * This is triggered when a RTC channel is closed
  *
  * @method webrtcOnChannelClose
  * @param channel @type {Object}
  */
  webrtcOnChannelClose(channel) {
    if (channel.label === 'simplewebrtc') {
      this.setValues({isDataChannelOpened: false});
      debug('Data channel closed.', arguments);
    }
  },

  /**
  * This is triggered when there is a channel error
  *
  * @method webrtcOnChannelError
  * @param channel @type {Object}
  */
  webrtcOnChannelError(channel) {
    if (channel.label === 'simplewebrtc') {
      this.setValues({isDataChannelOpened: false});
      error('Data channel error.', arguments);
    }
  },

  /**
  * This is triggered when a message is received on RTC Channel
  *
  * @method webrtcMessageRecieved
  * @param peer @type {Object}
  * @param channelName @type {string}
  * @param data @type {Object}
  */
  webrtcMessageRecieved(peer, channelName, data) {
    if (channelName === 'simplewebrtc') {
      const payload = data.payload;
      switch (data.type) {
        case 'message':
          payload.isRemote = true;
          payload.ifFinal = true;

          const message = Message.create(payload);
          this.get('messages').pushObject(message);

          this.say({
            // text: message.get('translatedContent'),
            // lang: this.get('localSpeechLanguage')
          });
          break;
        case 'language':
          this.setValues({'remoteSpeechLang': payload.language});
          break;
      }
      debug('Got message: ', data);
    }
  },

  /**
  * This is triggered when a peer is created
  *
  * @method createdPeer
  * @param peer
  *
  */
  createdPeer(peer) {
    debug('createdPeer', peer);
    if (peer && peer.pc) {
      let iceCandidate = peer.pc;
      iceCandidate.on('iceConnectionStateChange', () => {
        let state = peer.pc.iceConnectionState;
        debug('connection state is ' + state);
        switch (state) {
          case 'checking':
            this.get('action')('Connecting to partner...');
            break;
          case 'completed':
            debug('debug completed');
          case 'connected':
            debug('debug connected');
          case 'isConnected':
            this.get('action')('You are chatting with a partner');
            debug('debug isConnected');
            break;
          case 'closed':
          debug('debug closed');
          case 'disconnected':
            this.get('action')('You\'re on your own');
            break;
          case 'failed':
            this.get('action')('Connection Failed');
            break;
          default:
           this.get('action')('Something went wrong');
           debug('nothing (something?)');
           break;
        }
      });
    }
  },

  /**
  * This is triggered when RTC channel is ready to make a call to remote user.
  * This method initiates a tour of the chat room if not done already.
  *
  * @method showTour
  */
  showTour() {
    if (!window.localStorage.getItem('show-tour')) {
      // window.localStorage.setItem('show-tour', 'nope');
      // get(this, 'tour').start();
      // screw this
    }
  },

  /**
  * This method helps in sending request for joining video after rendering the
  * component.
  *
  * @method scheduleVideoJoin
  */
  scheduleVideoJoin() {
    Ember.run.scheduleOnce('afterRender', this, function () {
      this.joinRoom();
    });
  },

  /**
  * Joins the room and initiates the streams.
  *
  * @method joinRoom
  * @param media @type{Object}
  */
  joinRoom(media) {
    const sessionManager = this.get('webrtc');
    sessionManager.webrtc.startLocalMedia(media, (err, stream) => {
      if (err) {
        error(err);
      } else {
        this.setValues({stream: stream});
        this.connectToRoom();
      }
    });
  },

  /**
  * Connects to a specific room
  *
  * @method connectToRoom
  */
  connectToRoom() {
    const activeRoom = get(this, 'roomId');
    if (activeRoom) {
      const sessionManager = get(this, 'webrtc');
      sessionManager.joinRoom(activeRoom);
    }
  },

  /**
  * Leaves the room and stops the audio stream
  *
  * @method leaveRoom
  */
  leaveRoom() {
    debug('videoChat:leaveRoom');
    const localMedia = this.get('stream');
    if (localMedia) {
      (localMedia.getTracks() || []).forEach(t => t.stop());
    }
    get(this, 'webrtc').leaveRoom(this.get('roomId'));
    get(this, 'webrtc').disconnect();
    (get(this, 'webrtc.webrtc.localStreams') || []).forEach(stream => stream.getTracks().forEach(t => t.stop()));
  },

  /**
  * This method is triggered when a message is needed to be translated
  *
  * @method handleMessageTranslation
  * @param message @type {Object}
  */
  handleMessageTranslation(message) {
    let promise = null;
    if (this.get('isDataChannelOpened')) {
      //This is because the same pair of source and target throws 400 error for google translation api
      if(this.get('directToRoom') && this.get('localTranslationLanguage') === this.get('remoteTranslationLanguage')){
        message.set('translatedContent', message.get('formattedOriginalContent'));
        debug('final message is', message);
        this.sendMessage(message);
        promise = Ember.RSVP.resolve(message);
      } else {
        promise = this.translate({
          source: this.get('localTranslationLanguage'),
          target: this.get('clientTranslationLanguage'),
          q: message.get('formattedOriginalContent')
        }).then(data => {
          if (data.error) {
            error(data.error);
          } else {
            let translation = data.data.translations[0].translatedText;
            message.set('translatedContent', translation);
            //Checks if the remote langauge is same as the local language and if so, then reverses the content.
            if(this.get('remoteTranslationLanguage') === this.get('localTranslationLanguage')){
              let newMessage = Message.create({
                isFinal: true,
                originalContent: message.get('translatedContent'),
                translatedContent: message.get('formattedOriginalContent'),
              });
              debug('final message is', message);
              this.sendMessage(newMessage);
            } else {
              debug('final message is', message);
              this.sendMessage(message);
            }
          }
        });
      }
    } else {
      debug('channel is not open');
      promise = Ember.RSVP.resolve(message);
    }
    return promise;
  },

  /**
  * This method helps in sending the message to peer
  *
  * @method sendMessage
  * @param message @type {Object}
  */
  sendMessage(message) {
    debug('sending mesasge: ', message);
    const webrtc = get(this, 'webrtc');
    webrtc.sendDirectlyToAll('simplewebrtc', 'message', {
      originalContent: get(message, 'formattedOriginalContent'),
      translatedContent: get(message, 'translatedContent')
    });
  },

  /**
  * This method helps in sending the language message to peer
  *
  * @method sendLanguage
  * @param language @type {string}
  */
  sendLanguage(language) {
    debug('sending language: ', language);
    const webrtc = get(this, 'webrtc');
    webrtc.sendDirectlyToAll('simplewebrtc', 'language', {
      language: language
    });
  },

  /**
  * This method helps in getting the message translation
  *
  * @method translate
  * @param options @type {Object}
  */
  translate(options) {
    // Wrap jQuery promise in RSVP promise
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.getJSON('https://www.googleapis.com/language/translate/v2?callback=?', {
        key: config.GOOGLE_TRANSLATE_API_KEY,
        source: options.source,
        target: options.target,
        q: options.q
      })
        .then(resolve, reject);
    });
  },

  actions: {
    /**
    * This event is triggered to handle the chat message typed.
    *
    * @event handleChatMessage
    */
    handleChatMessage() {

            $('#chatForm').submit(function(){
            var form = $(this).find(':input[type=submit]');
            form.prop('disabled', true);
                window.setTimeout(function(){
                    form.prop('disabled',false);
                },1000);
            });

      let messages = get(this, 'messages') || [];
      let chatMsg = get(this, 'chatMessage');
      debug('The chat message is ', chatMsg);
      let chatMessage = Message.create({ originalContent: chatMsg, isFinal: true });
      if (messages.indexOf(chatMessage) === -1) {
        messages.pushObject(chatMessage);
        this.handleMessageTranslation(chatMessage)
          .finally(() => {
            this.setValues({chatMessage: null});
          });
      }
    },
  },

  /**
  * The observer moves the user back to waiting room, when the user selects a
  * different language
  *
  * @method localSpeechChange
  */
  localSpeechChange: Ember.observer('currentUser.localSpeechLanguage', function(){
    if(this.get('isDataChannelOpened')){
      this.sendLanguage(this.get('currentUser.localSpeechLanguage'));
    }
  }),
});
