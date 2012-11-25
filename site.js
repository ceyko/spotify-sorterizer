"use strict";

var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var views = sp.require('sp://import/scripts/api/views');
var player = models.player;


$(document).ready(function() {
  /** 
   * Setup #drop_box's handlers: highlight on drag, create playlist on drop.
   */
  $('#dropbox')
    .on('dragenter dragover', function(e) {
      e.originalEvent.dataTransfer.dropEffect = 'copy'; // allow drop
      $(this).addClass('over');
      return false;
    })
    .on('dragleave drop', function(e) {
      $(this).removeClass('over');
      return false;
    })
    .on('drop', function(e) {
      // get dropped playlist
      var uri = e.originalEvent.dataTransfer.getData('text');
      var playlist = models.Playlist.fromURI(uri);

      // add display player (to show playlist has been loaded)
      var player = new views.Player();
      player.track = null;
      player.context = playlist;
      $("#smart-player").empty().append(player.node);

      // show player and hide text
      $('#dropbox-text').css('display','none');
      $('#smart-player').css('display','block');

      return false;
    });
});

/**
 * Compare two values, returning 0 if equal, -1 if x<y, and 1 otherwise.
 */
function compare(x, y) {
	return x === y ? 0 : x <= y ? -1 : 1;
}

/**
 * Equivalent to Array.forEach, but also returns the array for chaining.
 */
Array.prototype.tap = function(f) { this.forEach(f); return this; };
