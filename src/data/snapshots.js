// Period-specific content for individual locations.
//
// Snapshots are OPTIONAL: a Location is shown on the map for any period in
// which it is extant (built and not yet demolished), regardless of whether a
// Snapshot exists. Snapshots only add richer content — descriptions, photos,
// captions — when they're available.
//
// Schema:
//   locationId       Matches a Location.id
//   periodIndex      Matches a TimePeriod.index (1..5)
//   description      Long-form text shown in the sidebar drill-down
//   image            URL to a photo
//   imageCaption     Caption shown above the image
//   imageDate        Year/date string shown after the caption
//   imageCredit      Attribution text under the image
//   imageCreditLink  Optional clickable URL for the credit
//   address          Optional override of Location.address for this period
//   latitude         Optional override of Location.latitude for this period
//   longitude        Optional override of Location.longitude for this period
//
// Add entries here as you author content.

export const SNAPSHOTS = []
