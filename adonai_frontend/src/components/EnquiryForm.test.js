import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EnquiryForm from "./EnquiryForm";

const jsonResponse = (body, ok = true) => ({
  ok,
  json: async () => body,
});

const fillRequiredFields = async ({
  name = "Jane Doe",
  email = "jane@example.com",
  mobile = "9876543210",
  captcha = "4",
} = {}) => {
  await userEvent.type(screen.getByPlaceholderText("Name"), name);
  await userEvent.type(screen.getByPlaceholderText("Email"), email);
  await userEvent.type(screen.getByPlaceholderText("Mobile No."), mobile);
  await userEvent.type(screen.getByPlaceholderText("Enter answer"), captcha);
};

beforeEach(() => {
  window.alert = jest.fn();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test("fetches and displays a CAPTCHA challenge on mount", async () => {
  fetch.mockResolvedValueOnce(jsonResponse({ question: "3 + 4", token: "token-abc" }));

  render(<EnquiryForm />);

  expect(fetch).toHaveBeenCalledWith("/api/captcha/");
  expect(await screen.findByText("3 + 4")).toBeInTheDocument();
});

test("marks name, email, mobile and captcha answer as required, message as optional", async () => {
  fetch.mockResolvedValueOnce(jsonResponse({ question: "3 + 4", token: "token-abc" }));
  render(<EnquiryForm />);
  await screen.findByText("3 + 4");

  expect(screen.getByPlaceholderText("Name")).toBeRequired();
  expect(screen.getByPlaceholderText("Email")).toBeRequired();
  expect(screen.getByPlaceholderText("Mobile No.")).toBeRequired();
  expect(screen.getByPlaceholderText("Enter answer")).toBeRequired();
  expect(screen.getByPlaceholderText("Message")).not.toBeRequired();
});

test("submits the CAPTCHA token alongside the form and shows the success message", async () => {
  fetch
    .mockResolvedValueOnce(jsonResponse({ question: "2 + 2", token: "token-1" })) // initial captcha fetch
    .mockResolvedValueOnce(
      jsonResponse({ message: "Enquiry submitted successfully. We will contact you soon." })
    )
    .mockResolvedValueOnce(jsonResponse({ question: "5 + 1", token: "token-2" })); // refetch after submit

  render(<EnquiryForm />);
  await screen.findByText("2 + 2");

  await fillRequiredFields({ captcha: "4" });
  await userEvent.type(screen.getByPlaceholderText("Message"), "Need a quote");
  await userEvent.click(screen.getByRole("button", { name: /submit now/i }));

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));

  const [submitUrl, submitOptions] = fetch.mock.calls[1];
  expect(submitUrl).toBe("/api/enquiry/");
  expect(JSON.parse(submitOptions.body)).toMatchObject({
    name: "Jane Doe",
    email: "jane@example.com",
    mobile: "9876543210",
    message: "Need a quote",
    captcha_token: "token-1",
    captcha_answer: "4",
  });

  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith(
      "Enquiry submitted successfully. We will contact you soon."
    )
  );

  // form resets and a fresh CAPTCHA is fetched (tokens are single-use)
  expect(await screen.findByText("5 + 1")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Name").value).toBe("");
});

test("shows the server error message and fetches a fresh CAPTCHA when submission fails", async () => {
  fetch
    .mockResolvedValueOnce(jsonResponse({ question: "6 - 1", token: "token-a" }))
    .mockResolvedValueOnce(jsonResponse({ captcha: ["Incorrect CAPTCHA answer."] }, false))
    .mockResolvedValueOnce(jsonResponse({ question: "9 - 3", token: "token-b" }));

  render(<EnquiryForm />);
  await screen.findByText("6 - 1");

  await fillRequiredFields({ captcha: "999" });
  await userEvent.click(screen.getByRole("button", { name: /submit now/i }));

  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("Incorrect CAPTCHA answer.")
    )
  );

  expect(await screen.findByText("9 - 3")).toBeInTheDocument();
});

test("shows a network error and still refreshes the CAPTCHA when the request itself fails", async () => {
  fetch
    .mockResolvedValueOnce(jsonResponse({ question: "1 + 1", token: "token-x" }))
    .mockRejectedValueOnce(new TypeError("Failed to fetch"))
    .mockResolvedValueOnce(jsonResponse({ question: "8 - 2", token: "token-y" }));

  render(<EnquiryForm />);
  await screen.findByText("1 + 1");

  await fillRequiredFields({ captcha: "2" });
  await userEvent.click(screen.getByRole("button", { name: /submit now/i }));

  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("Failed to fetch")
    )
  );

  expect(await screen.findByText("8 - 2")).toBeInTheDocument();
});
