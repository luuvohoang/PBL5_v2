using Backend.Models;
using Backend.Models.DTOs;

namespace Backend.Services
{
    public interface IExchangeService
    {
        Task<ProductExchange> CreateExchangeRequest(ExchangeRequestDto request);
        Task<ProductExchange> ProcessExchange(int exchangeId, ProcessExchangeDto request, int employeeId);
        Task<IEnumerable<ProductExchange>> GetUserExchanges(int userId);
        Task<IEnumerable<ProductExchange>> GetAllPendingExchanges();
        Task<bool> IsEligibleForExchange(int itemId);
    }
}
