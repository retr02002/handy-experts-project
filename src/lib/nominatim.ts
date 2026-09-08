// Shape of a result row from Nominatim's /search endpoint — shared by every
// component that lets a customer search for an address (AddressFormSheet,
// LocationPicker) so they don't need to import from one another.
export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
}
