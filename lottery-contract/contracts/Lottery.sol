// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ILotteryToken {
  function mint(address sender, uint256 amount) external;
  function transferFrom(address from, address to, uint256 amount) external returns (bool);
  function transfer(address to, uint256 amount) external returns (bool);
  function burnFrom(address account, uint256 amount) external;
}

contract Lottery is AccessControl, Ownable {
    using SafeMath for uint256;

	bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

	ILotteryToken public lotteryToken;
    
    struct Winner {
        address _player;
        uint256 _amount;
        uint256 _timestamp;
    }
	uint256 public ratio;
	uint256 public fee;
	uint256 public feePool;
	uint256 public prizePool;
	uint256 public closedAt;
	bool public isBetOpen = false;
    uint256 public _round = 0;

    mapping(uint256 => Winner) public _rounds;
	mapping(address => uint256) public _prizes;
	address [] _players;

    constructor(ILotteryToken _lotteryToken, uint256 _ratio, uint256 _fee) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);

		lotteryToken = _lotteryToken;
		ratio = _ratio;
		fee = _fee;
    }

    function openBets(uint256 _closedAt) public onlyOperator whenBetClosed {
        require(_closedAt > block.timestamp, "Close Time can't be in the past");
        closedAt = _closedAt;
        isBetOpen = true;
        _round += 1;
    }

	function buyTokens() public payable {
		require(msg.value > 0, 'Sent value is incorrect');
		lotteryToken.mint(msg.sender, msg.value * ratio);
	}

	function bet(uint256 amount) public whenBetOpen {
        lotteryToken.transferFrom(msg.sender, address(this), amount + fee);
		feePool += fee;
        prizePool += amount;
		_players.push(msg.sender);
    }

	function closeLottery() public onlyOperator whenBetOpen {
        require(block.timestamp >= closedAt, "Lottery: please wait until close time.");
        if (_players.length > 0) {
            address winner = _players[random() % _players.length];
            _prizes[winner] += prizePool;
            Winner memory _winner;
            _winner._player = winner;
            _winner._amount = prizePool;
            _winner._timestamp = block.timestamp;
            _rounds[_round] = _winner;
            prizePool = 0;
            delete _players;
        }
        isBetOpen = false;
    }

	function burnTokens(uint256 amount) public {
        lotteryToken.burnFrom(msg.sender, amount);
		uint256 _ethAmount = amount / ratio;
		require(address(this).balance > _ethAmount, "Insufficient balance");
        payable(msg.sender).transfer(_ethAmount);
    }

	function claimPrize() public {
        require(_prizes[msg.sender] > 0, "You don't have any prize yet.");
        lotteryToken.transfer(msg.sender, _prizes[msg.sender]);
		_prizes[msg.sender] = 0;
    }

 	function withdrawTokens(uint256 amount) public onlyOwner {
        require(feePool > amount, "Not enough amount of token.");
        lotteryToken.transfer(msg.sender, amount);
		feePool -= amount;
    }

    function currentWinner() public view returns (Winner memory) {
        return _rounds[_round];
    }

	function random() private view returns (uint) {
		return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, _players)));
    }

	modifier whenBetClosed() {
        require(!isBetOpen, "Lottery: not closed yet.");
        _;
    }

    modifier whenBetOpen() {
        require(isBetOpen, "Lottery: not open yet.");
        _;
    }

	modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "Operator: permission denied");
        _;
    }
}