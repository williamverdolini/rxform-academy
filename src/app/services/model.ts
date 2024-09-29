export class AddressItem {
  street: string | null;
  city: string | null;
  static nullValue = () => ({ street: null, city: null });
}
