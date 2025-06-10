import { shippingInfo } from "@/types/order";

const AddressForm = (shippingDetails: shippingInfo) => {
  return (
    <div className="relative p-2 w-full space-y-1">
      <p>
        {shippingDetails.houseNumber}, {shippingDetails.street}
      </p>
      <p>
        {shippingDetails.city}, {shippingDetails.state} -{" "}
        <b>{shippingDetails.pincode}</b>
      </p>
    </div>
  );
};

export default AddressForm;
