var MyPage = React.createClass({
  getInitialState: function() {
    return {
      dialogShown: false,
      alertDialogShown: false,
      toastShown: false,
      items: [
        {
          title: 'Dialog',
          fn: this.showDialog
        },
        {
          title: 'Alert dialog',
          fn: this.showAlertDialog
        },
        {
          title: 'Toast',
          fn: this.handleShow
        },
        {
          title: 'Alert notification',
          fn: () => ons.notification.alert('An error has occurred!')
        },
        {
          title: 'Confirmation',
          fn: () => ons.notification.confirm('Are you ready?')
        },
        {
          title: 'Prompt',
          fn: () => ons.notification.prompt('What\'s your name?')
        }
      ]
    };
  },

  showDialog: function() {
    this.setState({dialogShown: true});
  },

  hideDialog: function() {
    this.setState({dialogShown: false});
  },

  showAlertDialog: function() {
    this.setState({alertDialogShown: true});
  },

  hideAlertDialog: function() {
    this.setState({alertDialogShown: false});
  },

  handleShow: function() {
    this.setState({toastShown: true});
  },

  handleDismiss: function() {
    this.setState({toastShown: false});
  },

  renderRow(row) {
    return (
      <Ons.ListItem key={row.title} tappable onClick={row.fn}>
        {row.title}
      </Ons.ListItem>
    );
  },

  renderToolbar() {
    return (
      <Ons.Toolbar>
        <div className='center'>Dialogs</div>
      </Ons.Toolbar>
    );
  },

  render: function() {
    return (
      <Ons.Page renderToolbar={this.renderToolbar}>
        <Ons.List dataSource={this.state.items} renderRow={this.renderRow} />

        <Ons.Dialog
          isOpen={this.state.dialogShown}
          isCancelable={true}
          onCancel={this.hideDialog}>
          <div style={{textAlign: 'center', margin: '20px'}}>
            <p style={{opacity: 0.5}}>This is a dialog!</p>
            <p>
              <Ons.Button onClick={this.hideDialog}>Close</Ons.Button>
            </p>
          </div>
        </Ons.Dialog>

        <Ons.AlertDialog
          isOpen={this.state.alertDialogShown}
          isCancelable={false}>
          <div className='alert-dialog-title'>Warning!</div>
          <div className='alert-dialog-content'>
            An error has occurred!
          </div>
          <div className='alert-dialog-footer'>
            <button onClick={this.hideAlertDialog} className='alert-dialog-button'>
              Cancel
            </button>
            <button onClick={this.hideAlertDialog} className='alert-dialog-button'>
              Ok
            </button>
          </div>
        </Ons.AlertDialog>

        <Ons.Toast isOpen={this.state.toastShown}>
          <div className="message">
            An error has occurred!
          </div>
          <button onClick={this.handleDismiss}>
            Dismiss
          </button>
        </Ons.Toast>
      </Ons.Page>
    );
  }
});

ons.ready(function() {
  ReactDOM.render(<MyPage />, document.getElementById('app'));
});