module 0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmate { // Deployer's address in global storage
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use std::table::{Self, Table};
    use std::signer;
    use std::string::String;

    
    struct UserProfile has key {
        user_name: String,
        friends: vector<address>,
        conversations: Table<address, Conversation>,
    }
    
    struct UserInfo has store, drop, copy {
        address: address,
        user_name: String,
    }

    struct AllUsers has key {
        users: vector<UserInfo>,
    }

    struct UserCreatedEvent has drop, store {
        user_address: address,
        user_name: String,
    }

    struct Conversation has store {
        messages: vector<Message>,
        payments: vector<Payment>,
    }

    struct Message has store, drop, copy {
        sender: address,
        content: String,
        timestamp: u64,
    }

    struct Payment has store, drop, copy {
        sender: address,
        amount: u64,
        note: String,
        timestamp: u64,
    }


    // Error codes
    const E_USER_ALREADY_EXISTS: u64 = 1;
    const E_USER_NOT_FOUND: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_SELF_OPERATION_NOT_ALLOWED: u64 = 4;
    const E_NOT_FRIEND: u64 = 5;

    public entry fun create_id(account: &signer, user_name: String) acquires AllUsers {
        let signer_address = signer::address_of(account);
        assert!(!exists<UserProfile>(signer_address), E_USER_ALREADY_EXISTS);

        let user_profile = UserProfile {
            user_name: copy user_name,
            friends: vector::empty<address>(),
            conversations: table::new(),
        };

        move_to(account, user_profile);

        // Add UserInfo to AllUsers list
        let module_addr = @0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435;
        let all_users = borrow_global_mut<AllUsers>(module_addr);
        vector::push_back(&mut all_users.users, UserInfo { address: signer_address, user_name });
    }


    public fun add_friend(account: &signer, friend_address: address) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);
        assert!(exists<UserProfile>(friend_address), E_USER_NOT_FOUND);
        assert!(signer_address != friend_address, E_SELF_OPERATION_NOT_ALLOWED);

        let user_profile = borrow_global_mut<UserProfile>(signer_address);
        if (!vector::contains(&user_profile.friends, &friend_address)) {
            vector::push_back(&mut user_profile.friends, friend_address);
            table::add(&mut user_profile.conversations, friend_address, Conversation {
                messages: vector::empty(),
                payments: vector::empty(),
            });
        }
    }

    public entry fun send_payment(
        account: &signer,
        recipient: address,
        amount: u64,
        note: String
    ) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);
        assert!(exists<UserProfile>(recipient), E_USER_NOT_FOUND);
        assert!(signer_address != recipient, E_SELF_OPERATION_NOT_ALLOWED);

        let user_profile = borrow_global_mut<UserProfile>(signer_address);
        assert!(vector::contains(&user_profile.friends, &recipient), E_NOT_FRIEND);

        // Transfer AptosCoin
        let coins = coin::withdraw<AptosCoin>(account, amount);
        coin::deposit(recipient, coins);

        // Record the payment in both users' conversation records
        let payment = Payment {
            sender: signer_address,
            amount,
            note,
            timestamp: timestamp::now_seconds(),
        };

        let sender_conversation = table::borrow_mut(&mut user_profile.conversations, recipient);
        vector::push_back(&mut sender_conversation.payments, payment);

        // Create a new payment instance for the recipient's conversation
    let recipient_payment = Payment {
        sender: signer_address,
        amount,
        note,
        timestamp: timestamp::now_seconds(),
    };

        let recipient_profile = borrow_global_mut<UserProfile>(recipient);
        let recipient_conversation = table::borrow_mut(&mut recipient_profile.conversations, signer_address);
        vector::push_back(&mut recipient_conversation.payments, recipient_payment);
    }

    public fun send_message(account: &signer, recipient: address, content: String) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);
        assert!(exists<UserProfile>(recipient), E_USER_NOT_FOUND);

        let user_profile = borrow_global_mut<UserProfile>(signer_address);
        assert!(vector::contains(&user_profile.friends, &recipient), E_NOT_FRIEND);

        let message = Message {
            sender: signer_address,
            content,
            timestamp: timestamp::now_seconds(),
        };

        // Add message to sender's conversation
        let sender_conversation = table::borrow_mut(&mut user_profile.conversations, recipient);
        vector::push_back(&mut sender_conversation.messages, message);

        let recipient_message = Message {
            sender: signer_address,
            content,
            timestamp: timestamp::now_seconds(),
        };

        // Add message to recipient's conversation
        let recipient_profile = borrow_global_mut<UserProfile>(recipient);
        let recipient_conversation = table::borrow_mut(&mut recipient_profile.conversations, signer_address);
        vector::push_back(&mut recipient_conversation.messages, recipient_message);
    }

    #[view]
    // Helper function to get user profile
    public fun get_username(account_address: address): String acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        // Return the user_name directly
        user_profile.user_name
    }

    #[view] 
    public fun get_all_users(): vector<UserInfo> acquires AllUsers {
        assert!(exists<AllUsers>(@0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435), 0);
        *&borrow_global<AllUsers>(@0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435).users
    }
    
    #[view]
    // Helper function to get friends list
    public fun get_friends(account_address: address): vector<address> acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        *&user_profile.friends
    }

    // Helper function to get conversation with a specific friend
    public fun get_conversation(account_address: address, friend_address: address): (vector<Message>, vector<Payment>) acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        assert!(vector::contains(&user_profile.friends, &friend_address), E_NOT_FRIEND);

        let conversation = table::borrow(&user_profile.conversations, friend_address);
        (conversation.messages, conversation.payments)
    }
}