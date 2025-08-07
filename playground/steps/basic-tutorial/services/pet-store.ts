export const petStoreService = {
  createPet: async (pet: { name: string; photoUrl: string }) => {
    const response = await fetch('https://petstore.swagger.io/v2/pet', {
      method: 'POST',
      body: JSON.stringify({
        name: pet.name,
        photoUrls: [pet.photoUrl],
        status: 'available',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.json()
  },
}
