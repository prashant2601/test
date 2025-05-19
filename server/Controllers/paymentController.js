
const BankAccounts = require("../Models/bank_accounts");
const { getNextId } = require("../Utils/utils");
exports.GetAllBankAccounts = async (req, res) => {
    const {accountHolderName, accountRole, pageNo= 1, limit = 10} = req.query;
    try {
    
        const page = parseInt(pageNo, 10) || 1;
        const limitValue = parseInt(limit, 10) || 10;
    
        const matchStage = {};
    
        if (accountHolderName) {
            const accountHolderNameRegexArray = accountHolderName.split(',').map(un => new RegExp(un.trim(), 'i'));
            matchStage.accountHolderName = { $in: accountHolderNameRegexArray };
          }
        if (accountRole) matchStage.accountRole = { $in: accountRole.split(',').map(role => role.trim()) };
    
        const sortStage = {};
        sortStage.accountAddedOn = -1;
    
        const pipeline = [
          { $match: matchStage },
          ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
          { $skip: (page - 1) * limitValue },
          { $limit: limitValue },
          {
            $project: {
              __v: 0,
              _id: 0
            }
          }
        ];
    
        const result = await BankAccounts.aggregate(pipeline);
    
        const totalCount = await BankAccounts.countDocuments(matchStage);
    
        const totalPages = Math.ceil(totalCount / limitValue);
    
        res.status(200).json({ bankAccounts: result, totalCount, totalPages, currentPage: page, });
    
      } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
}

exports.AddBankAccounts = async (req, res) => {
    const { accountHolderName, accountNumber, bankName, sortCode, accountRole, accountHolderId, merchantId, merchantName } = req.body

    try {

        if (!accountHolderName || !accountNumber || !bankName || !sortCode || !accountRole) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const accId = await getNextId('bankAccount');

        const newBankAccount = new BankAccounts({
            accId,
            accountHolderName,
            accountNumber,
            bankName,
            sortCode,
            accountRole,
            accountHolderId: accountHolderId || 0,
        });

        if (merchantId && merchantName) {
            newBankAccount.merchantId = merchantId;
            newBankAccount.merchantName = merchantName;
        }

        await newBankAccount.save();

        res.status(200).json({ message: "Bank account added successfully", success: true });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.EditBankAccounts = async (req, res) => {
    const {accId, accountHolderName, accountNumber, bankName, sortCode, accountRole, accountHolderId, merchantId, merchantName } = req.body

    try {

        const bankAccount = await BankAccounts.findOne({accId});

        if(!bankAccount){
            return res.status(400).json({ message: "No Bank Account Found", success: false });
        }

        if (accountHolderName) {
            bankAccount.accountHolderName = accountHolderName;
        }
        if (accountNumber) {
            bankAccount.accountNumber = accountNumber;
        }
        if (bankName) {
            bankAccount.bankName = bankName;
        }
        if (sortCode) {
            bankAccount.sortCode = sortCode;
        }
        if (accountRole) {
            bankAccount.accountRole = accountRole;
        }
        if (accountHolderId !== undefined) {
            bankAccount.accountHolderId = accountHolderId;
        }
        if (merchantId) {
            bankAccount.merchantId = merchantId;
        }
        if (merchantName) {
            bankAccount.merchantName = merchantName;
        }

        await bankAccount.save();
        res.status(200).json({ message: "Bank account edited successfully", success: true });
        
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.DeleteBankAccounts = async (req, res) => {
    const { ids } = req.query;
    if (!ids) {
        return res.status(400).json({ message: "query parameter is required", success: false });
    }

    const accIds = ids.split(',')
        .map(id => id?.trim())
        .filter(id => id); // Remove empty values

    if (accIds.length === 0) {
        return res.status(400).json({ message: "No valid id provided", success: false });
    }

    try {

        const result = await BankAccounts.deleteMany({ accId: { $in: accIds } });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No accounts found to delete", success: false });
        }

        res.status(200).json({ message: "Bank account deleted", success: true, deletedCount: result.deletedCount });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }

}