exports.handler = async (event) => {
  const message =
    'Shivashish Naramdeo says ' + event.queryStringParameters.keyword
  const response = {
    statusCode: 200,
    body: JSON.stringify({ message })
  }
  return response
}
