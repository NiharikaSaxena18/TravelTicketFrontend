const urlParams = new URLSearchParams(window.location.search);
const packageId = urlParams.get("id");
console.log("Package ID:", packageId);

const numPeopleSelect = document.getElementById("num-people");
const journeySelect = document.getElementById("journey-duration");

for (let i = 1; i <= 15; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.text = i;
  numPeopleSelect.appendChild(option);
}

for (let i = 1; i <= 15; i++) {
  const option = document.createElement("option");
  option.value = i;
  if (i === 1) {
    option.text = "1 day";
  } else {
    option.text = i + " days";
  }
  journeySelect.appendChild(option);
}

let basePrice = 0;

axios
  .get(`http://localhost:4000/api/package/${packageId}`)
  .then((response) => {
    const cartItem = response.data;
    document.getElementById("package-image").src = cartItem.image.url;
    document.getElementById("destination").innerHTML = cartItem.title;
    document.getElementById("location").innerHTML = cartItem.location;
    document.getElementById("country").innerHTML = cartItem.country;
    document.getElementById("price").innerHTML = cartItem.price;
    basePrice = cartItem.price;
    const numPeople = parseInt(document.getElementById("num-people").value);
    const subTotal = numPeople * basePrice;
    document.getElementById("sub-total").innerHTML = `&#8377;${subTotal}`;
    const totalAmount = subTotal + 2000 + 300;
    document.getElementById("total-amount").innerHTML = `&#8377;${totalAmount}`;
  })
  .catch((error) => {
    console.error(error);
  });

function updateTotal() {
  const numPeople = parseInt(document.getElementById("num-people").value);
  const journeyDuration = parseInt(
    document.getElementById("journey-duration").value
  );
  const subTotal = numPeople * journeyDuration * basePrice;
  const travelExpenses = numPeople * 2000;
  const totalAmount = subTotal + travelExpenses + 300;
  document.getElementById("sub-total").innerHTML = `&#8377;${subTotal}`;
  document.getElementById(
    "travel-expenses"
  ).innerHTML = `&#8377;${travelExpenses}`;
  document.getElementById("total-amount").innerHTML = `&#8377;${totalAmount}`;

  //store them in local storage
  localStorage.setItem("totalAmount", totalAmount);
  localStorage.setItem("subTotal", subTotal + travelExpenses);
}

document.getElementById("num-people").addEventListener("change", updateTotal);
document
  .getElementById("journey-duration")
  .addEventListener("change", updateTotal);

const btn = document.getElementById("proceed-to-checkout");
btn.addEventListener("click", () => {
  const url = "/TravelTicketFrontend/public/pages/checkout.html";
  window.location.href = url;
});