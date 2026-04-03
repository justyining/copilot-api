import consola from "consola"

import { APIError } from "./error"

export const awaitApproval = async () => {
  const response = await consola.prompt(`Accept incoming request?`, {
    type: "confirm",
  })

  if (!response) {
    throw new APIError(
      "invalid_request_error",
      "Request rejected by manual approval",
      403,
    )
  }
}
