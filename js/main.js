/**
 * The jQuery selector for "Show folder size" buttons.
 *
 * @type {string}
 */
const plugin_button_selector = 'a.show-folder-size';

/**
 * Button onclick function.
 *
 * @global
 */
const plugin_show_folder_size = () => {
  const $btn = $(plugin_button_selector);

  if ($btn.hasClass('disabled')) {
    return;
  }

  $btn.addClass('disabled');

  get_mailbox_a().attr('data-folder-size', '');
  rcmail.http_post('plugin.folder-size', {_folders: '__ALL__', _humanize: 1}, true);
};

/**
 * The callback function when RC's API responses.
 *
 * @param {Object.<string, string|Number>} resp the response, { mailbox: size }
 */
const callback_show_folder_size = (resp) => {

  const table = $('<table id="show-folder-size-table">');
  table.append($('<tr><th>Name</th><th>Size</th></tr>'));

  let totalSize = 0;

  for (let index = 0; index < rcmail.env.mailboxes_list.length; index++) {
      const mailboxId = rcmail.env.mailboxes_list[index];
      const mailbox = rcmail.env.mailboxes[mailboxId];
      const size = resp[mailboxId];
  
      // 階層をチェック
      const level = mailboxId.split('.').length;
  
      const tr = $('<tr>');
      tr.append($('<td>').text('\u00A0\u00A0'.repeat(level - 1) + mailbox.name));
      tr.append($('<td class="folder-size">').text(size.toLocaleString()));
      table.append(tr);

      totalSize += size;
  }
  
  // 合計行
  const tr = $('<tr class="total-folder-size">');
  tr.append($('<td class="total-folder">').text('Total'));
  tr.append($('<td class="folder-size">').text(totalSize.toLocaleString()));
  table.append(tr);
  
  rcmail.show_popup_dialog(table, 'Folder Size');

  $(plugin_button_selector).removeClass('disabled');
};

/**
 * Get the jQuery DOM of a mailbox.
 *
 * @param  {string}   mailbox the mailbox
 * @return {JQuery[]} jQuery DOMs
 */
const get_mailbox_a = (mailbox) => {
  const attr_selector = typeof mailbox !== 'undefined' ? `[rel="${mailbox}"]` : '[rel]';

  return $(`#mailboxlist a${attr_selector}`);
};

rcmail.addEventListener('plugin.callback_folder_size', callback_show_folder_size);

// expose
global.plugin_show_folder_size = plugin_show_folder_size;

/*
// the way to call the plugin API manually
$.ajax({
  type: 'POST',
  dataType: 'json',
  url: '?_action=plugin.folder-size',
  data: {
    _remote: 1, _unlock: 1, // Roundcube's must
    _folders: '__ALL__',
    _humanize: 1,
  },
  success: (data) => {
    const resp = data.callbacks[0][1];
    console.log(resp);

    callback_show_folder_size(resp);
  },
});
*/
