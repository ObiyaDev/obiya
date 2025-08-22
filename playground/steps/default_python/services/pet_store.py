import httpx
from typing import Dict, Any
from .types import Order, Pet

class PetStoreService:
    async def create_pet(self, pet: Dict[str, Any]) -> Pet:
        pet_data = {
            "name": pet["name"],
            "photoUrls": [pet["photo_url"]],
            "status": "available"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://petstore.swagger.io/v2/pet',
                json=pet_data,
                headers={'Content-Type': 'application/json'}
            )
            return response.json()
    
    async def create_order(self, order: Dict[str, Any]) -> Order:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://petstore.swagger.io/v2/store/order',
                json=order,
                headers={'Content-Type': 'application/json'}
            )
            return response.json()

pet_store_service = PetStoreService()