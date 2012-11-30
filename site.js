"use strict";

var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var views = sp.require('sp://import/scripts/api/views');
var player = models.player;

$(document).ready(function() {
  /**
   * Current dropped playlist.
   */
  var playlist = null;

  /**
   * Construct jquery elements.
   */
  $("#sort-radio-container").buttonset();

  /**
   * Setup sort button's handlers: sort on click.
   */
  $("#sort-button").button()
    .on('click', function(e) {
      if (playlist) {
        var name = $('#sort-title').val() || "unnamed";
        sort_by(playlist, name, get_sort_function());
      }
    });

  /** 
   * Setup #dropbox's handlers: highlight on drag, create playlist on drop.
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
      playlist = models.Playlist.fromURI(uri);

      // add display player (to show playlist has been loaded)
      var player = new views.Player();
      player.track = null;
      player.context = playlist;
      $("#smart-player").empty().append(player.node);

      // fill in default name for playlist
      $('#sort-title').val(playlist.name + " (sorted)");

      // show player and hide text
      $('#dropbox-text').css('display','none');
      $('#smart-player').css('display','block');

      return false;
    });
});

/**
 * Create a copy of playlist, with tracks sorted by the value computed by sort_value.
 *
 * @param {models.Playlist} playlist The spotify playlist to sort.
 * @param {String} name The title of the new playlist.
 * @param {Function} sort_value Function used to sort tracks:
 *    models.Track -> *
 * @return {models.Playlist} A new sorted playlist.
 */
function sort_by(playlist, name, sort_value) {
  // sort on a clone so we don't edit the original playlist
  var sorted_tracks = playlist.tracks.clone()
    .sort(function(x,y){ return compare(sort_value(x),sort_value(y)); })

  // all tracks in sorted order to new playlist
  var new_playlist = new models.Playlist(name);
  new_playlist.add(sorted_tracks);
  return new_playlist;
}

/**
 * Return a function used to sort tracks, based on which checkbox is checked.
 *
 * @return {Function} models.Track -> (string or number)
 */
function get_sort_function() {
  if ($('#sort-on-title').prop('checked')) {
    return function(x){ return x.name };
  }
  if ($('#sort-on-artist').prop('checked')) {
    return function(x){ return x.artists[0].name };
  }
  if ($('#sort-on-album').prop('checked')) {
    return function(x){ return x.album.name };
  }
  if ($('#sort-on-popularity').prop('checked')) {
    return function(x){ return x.popularity };
  }
  return function(x){ return x };
}

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

/**
 * Returns a shallow copy of the array.
 */
Array.prototype.clone = function(x) { return this.map(function(y) { return y; }); };
