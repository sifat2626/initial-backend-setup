module.exports = ({
  pascal,
  camel,
}) => `import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { ${pascal}Services } from "./${camel}.service"

const create${pascal} = catchAsync(async (req, res) => {
  const ${camel} = await ${pascal}Services.create${pascal}(req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "${pascal} created successfully",
    data: ${camel},
  })
})

const getAll${pascal}s = catchAsync(async (req, res) => {
  const ${camel}s = await ${pascal}Services.getAll${pascal}s(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "${pascal}s retrieved successfully",
    data: ${camel}s,
  })
})

const getSingle${pascal} = catchAsync(async (req, res) => {
  const ${camel} = await ${pascal}Services.getSingle${pascal}(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "${pascal} retrieved successfully",
    data: ${camel},
  })
})

const update${pascal} = catchAsync(async (req, res) => {
  const ${camel} = await ${pascal}Services.update${pascal}(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "${pascal} updated successfully",
    data: ${camel},
  })
})

const delete${pascal} = catchAsync(async (req, res) => {
  const ${camel} = await ${pascal}Services.delete${pascal}(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "${pascal} deleted successfully",
    data: ${camel},
  })
})

export const ${pascal}Controllers = {
  create${pascal},
  getAll${pascal}s,
  getSingle${pascal},
  update${pascal},
  delete${pascal},
}
`
