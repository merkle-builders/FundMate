module 0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev4 {
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account;
    use std::table::{Self, Table};
    use std::signer;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    
    // User Settings Structures
    struct UserSettings has store {
        privacy_enabled: bool,
        notification_preferences: NotificationPreferences,
        default_split_method: SplitMethod,
        auto_approve_below: Option<u64>,
    }

    struct NotificationPreferences has store, drop {
        payment_notifications: bool,
        message_notifications: bool,
        request_notifications: bool,
        group_notifications: bool,
    }

    struct SplitMethod has store, drop {
        split_type: u8, // 0 = Equal, 1 = Percentage, 2 = Custom
    }

    struct UserProfile has key {
        user_name: String,
        friends: vector<address>,
        conversations: Table<address, Conversation>,
        sent_payment_requests: Table<address, vector<PaymentRequest>>,
        received_payment_requests: Table<address, vector<PaymentRequest>>,
        requestees: vector<address>,
        requesters: vector<address>,
        groups: vector<address>,
        settings: UserSettings,
        profile_picture: Option<String>,
        total_transactions: u64,
        user_rating: u64,
        blocked_users: vector<address>,
        user_created_events: event::EventHandle<UserCreatedEvent>,
        friend_added_events: event::EventHandle<FriendAddedEvent>,
        payment_sent_events: event::EventHandle<PaymentSentEvent>,
        message_sent_events: event::EventHandle<MessageSentEvent>,
        payment_requested_events: event::EventHandle<PaymentRequestedEvent>,
        group_created_events: event::EventHandle<GroupCreatedEvent>,
        user_blocked_events: event::EventHandle<UserBlockedEvent>,
        settings_updated_events: event::EventHandle<SettingsUpdatedEvent>,
    }

    struct UserInfo has store, drop, copy {
        address: address,
        user_name: String,
    }

    struct GroupProfile has key {
        group_name: String,
        members: vector<UserInfo>,
        conversation: Conversation,
        group_balance: u64,
        expense_history: vector<Expense>,
        admin: address,
        group_rules: vector<String>,
        group_type: u8,
        created_at: u64,
    }

    struct AllUsers has key {
        users: vector<UserInfo>,
    }

    struct Conversation has store {
        messages: vector<Message>,
        payments: vector<Payment>,
        payment_requests: vector<PaymentRequest>,
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

    struct PaymentRequest has store, drop, copy {
        requester: address,
        amount: u64,
        note: String,
        timestamp: u64,
    }

    struct Expense has store, drop {
        description: String,
        amount: u64,
        paid_by: address,
        split_among: vector<address>,
        timestamp: u64,
        status: u8,  // 0 = Pending, 1 = Settled, 2 = Disputed
    }

    // Events
    #[event]
    struct UserCreatedEvent has drop, store {
        user_address: address,
        user_name: String,
    }

    #[event]
    struct FriendAddedEvent has drop, store {
        user_address: address,
        friend_address: address,
    }

    #[event]
    struct PaymentSentEvent has drop, store {
        sender: address,
        recipient: address,
        amount: u64,
    }

    #[event]
    struct MessageSentEvent has drop, store {
        sender: address,
        recipient: address,
    }

    #[event]
    struct PaymentRequestedEvent has drop, store {
        requester: address,
        requestee: address,
        amount: u64,
    }

    #[event]
    struct GroupCreatedEvent has store, drop {
        user_address: address,
        group_name: String,
    }

    #[event]
    struct UserBlockedEvent has drop, store {
        blocker: address,
        blocked: address,
    }

    #[event]
    struct SettingsUpdatedEvent has drop, store {
        user_address: address,
        timestamp: u64,
    }

    // Error codes
    const E_USER_ALREADY_EXISTS: u64 = 1;
    const E_USER_NOT_FOUND: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_SELF_OPERATION_NOT_ALLOWED: u64 = 4;
    const E_NOT_FRIEND: u64 = 5;
    const E_INVALID_AMOUNT: u64 = 6;
    const E_USER_ALREADY_INGROUP: u64 = 7;
    const E_GROUP_NOT_FOUND: u64 = 8;
    const E_INVALID_GROUP: u64 = 9;
    const E_USER_NOT_FOUND_BY_USERNAME: u64 = 10;
    const E_USER_BLOCKED: u64 = 11;
    const E_INSUFFICIENT_GROUP_BALANCE: u64 = 12;
    const E_NOT_GROUP_ADMIN: u64 = 13;
    const E_INVALID_RATING: u64 = 14;

    fun init_module(account: &signer) {
        move_to(account, AllUsers { users: vector::empty() });
    }

    fun init_user_settings(): UserSettings {
        UserSettings {
            privacy_enabled: false,
            notification_preferences: NotificationPreferences {
                payment_notifications: true,
                message_notifications: true,
                request_notifications: true,
                group_notifications: true,
            },
            default_split_method: SplitMethod { split_type: 0 },
            auto_approve_below: option::none(),
        }
    }

    public entry fun create_id(account: &signer, user_name: String) acquires AllUsers, UserProfile {
        let signer_address = signer::address_of(account);
        assert!(!exists<UserProfile>(signer_address), E_USER_ALREADY_EXISTS);

        let user_profile = UserProfile {
            user_name,
            friends: vector::empty(),
            conversations: table::new(),
            sent_payment_requests: table::new(),
            received_payment_requests: table::new(),
            requestees: vector::empty(),
            requesters: vector::empty(),
            groups: vector::empty(),
            settings: init_user_settings(),
            profile_picture: option::none(),
            total_transactions: 0,
            user_rating: 0,
            blocked_users: vector::empty(),
            user_created_events: account::new_event_handle<UserCreatedEvent>(account),
            friend_added_events: account::new_event_handle<FriendAddedEvent>(account),
            payment_sent_events: account::new_event_handle<PaymentSentEvent>(account),
            message_sent_events: account::new_event_handle<MessageSentEvent>(account),
            payment_requested_events: account::new_event_handle<PaymentRequestedEvent>(account),
            group_created_events: account::new_event_handle<GroupCreatedEvent>(account),
            user_blocked_events: account::new_event_handle<UserBlockedEvent>(account),
            settings_updated_events: account::new_event_handle<SettingsUpdatedEvent>(account),
        };
    
        move_to(account, user_profile);

        let all_users = borrow_global_mut<AllUsers>(@0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435);
        vector::push_back(&mut all_users.users, UserInfo { address: signer_address, user_name });

        event::emit_event(
            &mut borrow_global_mut<UserProfile>(signer_address).user_created_events,
            UserCreatedEvent { user_address: signer_address, user_name }
        );
    }

    public entry fun update_user_settings(
        account: &signer,
        privacy_enabled: bool,
        payment_notif: bool,
        message_notif: bool,
        request_notif: bool,
        group_notif: bool,
        split_type: u8,
        auto_approve_amount: Option<u64>
    ) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);

        let user_profile = borrow_global_mut<UserProfile>(signer_address);
        user_profile.settings = UserSettings {
            privacy_enabled,
            notification_preferences: NotificationPreferences {
                payment_notifications: payment_notif,
                message_notifications: message_notif,
                request_notifications: request_notif,
                group_notifications: group_notif,
            },
            default_split_method: SplitMethod { split_type },
            auto_approve_below: auto_approve_amount,
        };

        event::emit_event(
            &mut user_profile.settings_updated_events,
            SettingsUpdatedEvent { user_address: signer_address, timestamp: timestamp::now_seconds() }
        );
    }

    public entry fun block_user(account: &signer, user_to_block: address) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);
        assert!(exists<UserProfile>(user_to_block), E_USER_NOT_FOUND);
        assert!(signer_address != user_to_block, E_SELF_OPERATION_NOT_ALLOWED);

        let user_profile = borrow_global_mut<UserProfile>(signer_address);
        if (!vector::contains(&user_profile.blocked_users, &user_to_block)) {
            vector::push_back(&mut user_profile.blocked_users, user_to_block);
            event::emit_event(
                &mut user_profile.user_blocked_events,
                UserBlockedEvent { blocker: signer_address, blocked: user_to_block }
            );
        };
    }

    public entry fun add_friend(account: &signer, friend_address: address) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);
        assert!(exists<UserProfile>(friend_address), E_USER_NOT_FOUND);
        assert!(signer_address != friend_address, E_SELF_OPERATION_NOT_ALLOWED);

        let user_profile = borrow_global_mut<UserProfile>(signer_address);
        assert!(!vector::contains(&user_profile.blocked_users, &friend_address), E_USER_BLOCKED);

        if (!vector::contains(&user_profile.friends, &friend_address)) {
            vector::push_back(&mut user_profile.friends, friend_address);
            table::add(&mut user_profile.conversations, friend_address, Conversation {
                messages: vector::empty(),
                payments: vector::empty(),
                payment_requests: vector::empty()
            });

            event::emit_event(
                &mut user_profile.friend_added_events,
                FriendAddedEvent { user_address: signer_address, friend_address }
            );
        }
    }

    public entry fun create_group(
        account: &signer, 
        group_name: String,
        group_type: u8,
        group_rules: vector<String>
    ) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);

        let creator_profile = borrow_global<UserProfile>(signer_address);
        let creator_info = UserInfo { 
            address: signer_address, 
            user_name: creator_profile.user_name 
        };

        let group_profile = GroupProfile {
            group_name,
            members: vector::singleton(creator_info),
            conversation: Conversation {
                messages: vector::empty(),
                payments: vector::empty(),
                payment_requests: vector::empty(),
            },
            group_balance: 0,
            expense_history: vector::empty(),
            admin: signer_address,
            group_rules,
            group_type,
            created_at: timestamp::now_seconds(),
        };

        move_to(account, group_profile);

        let user_profile = borrow_global_mut<UserProfile>(signer_address);
        vector::push_back(&mut user_profile.groups, signer_address);

        event::emit_event(
            &mut user_profile.group_created_events,
            GroupCreatedEvent { user_address: signer_address, group_name }
        );
    }

    public entry fun add_group_expense(
        account: &signer,
        group_creator: address,
        description: String,
        amount: u64,
        split_among: vector<address>
    ) acquires GroupProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<GroupProfile>(group_creator), E_GROUP_NOT_FOUND);

        let group = borrow_global_mut<GroupProfile>(group_creator);
        
        let expense = Expense {
            description,
            amount,
            paid_by: signer_address,
            split_among,
            timestamp: timestamp::now_seconds(),
            status: 0,
        };

        vector::push_back(&mut group.expense_history, expense);
    }

    public entry fun send_group_payment(
        account: &signer,
        group_creator: address,
        amount: u64,
        note: String
    ) acquires GroupProfile, UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<GroupProfile>(group_creator), E_GROUP_NOT_FOUND);

        let group = borrow_global_mut<GroupProfile>(group_creator);
        let num_members = vector::length(&group.members);
        assert!(num_members > 0, E_INVALID_GROUP);

        let amount_per_member = amount / (num_members as u64);
        assert!(amount_per_member > 0, E_INVALID_AMOUNT);

        let total_coins = coin::withdraw<AptosCoin>(account, amount);

        let i = 0;
        while (i < num_members) {
            let member = vector::borrow(&group.members, i);
            let member_coins = coin::extract(&mut total_coins, amount_per_member);
            coin::deposit(member.address, member_coins);
            i = i + 1;
        };

        if (coin::value(&total_coins) > 0) {
            coin::deposit(signer_address, total_coins);
} else {
            coin::destroy_zero(total_coins);
        };

        let payment = Payment {
            sender: signer_address,
            amount,
            note,
            timestamp: timestamp::now_seconds(),
        };
        vector::push_back(&mut group.conversation.payments, payment);

        let sender_profile = borrow_global_mut<UserProfile>(signer_address);
        sender_profile.total_transactions = sender_profile.total_transactions + 1;
        
        event::emit_event(
            &mut sender_profile.payment_sent_events,
            PaymentSentEvent { 
                sender: signer_address, 
                recipient: group_creator,
                amount 
            }
        );
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

        // Check if recipient has blocked sender
        let recipient_profile = borrow_global<UserProfile>(recipient);
        assert!(!vector::contains(&recipient_profile.blocked_users, &signer_address), E_USER_BLOCKED);

        {
            let sender_profile = borrow_global_mut<UserProfile>(signer_address);
            assert!(!vector::contains(&sender_profile.blocked_users, &recipient), E_USER_BLOCKED);

            if (!table::contains(&sender_profile.conversations, recipient)) {
                table::add(&mut sender_profile.conversations, recipient, Conversation {
                    messages: vector::empty(),
                    payments: vector::empty(),
                    payment_requests: vector::empty()
                });
            };

            let coins = coin::withdraw<AptosCoin>(account, amount);
            coin::deposit(recipient, coins);

            let payment = Payment {
                sender: signer_address,
                amount,
                note,
                timestamp: timestamp::now_seconds(),
            };

            let sender_conversation = table::borrow_mut(&mut sender_profile.conversations, recipient);
            vector::push_back(&mut sender_conversation.payments, payment);

            // Update transaction counter
            sender_profile.total_transactions = sender_profile.total_transactions + 1;

            event::emit_event(
                &mut sender_profile.payment_sent_events,
                PaymentSentEvent { 
                    sender: signer_address, 
                    recipient, 
                    amount 
                }
            );
        };

        {
            let recipient_profile = borrow_global_mut<UserProfile>(recipient);
            if (!table::contains(&recipient_profile.conversations, signer_address)) {
                table::add(&mut recipient_profile.conversations, signer_address, Conversation {
                    messages: vector::empty(),
                    payments: vector::empty(),
                    payment_requests: vector::empty()
                });
            };
            let recipient_conversation = table::borrow_mut(&mut recipient_profile.conversations, signer_address);
            let payment = Payment {
                sender: signer_address,
                amount,
                note,
                timestamp: timestamp::now_seconds(),
            };
            vector::push_back(&mut recipient_conversation.payments, payment);
        };
    }

    public entry fun send_message(
        account: &signer,
        recipient: address,
        content: String
    ) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);
        assert!(exists<UserProfile>(recipient), E_USER_NOT_FOUND);

        // Check blocks
        let sender_profile = borrow_global<UserProfile>(signer_address);
        assert!(!vector::contains(&sender_profile.blocked_users, &recipient), E_USER_BLOCKED);
        
        let recipient_profile = borrow_global<UserProfile>(recipient);
        assert!(!vector::contains(&recipient_profile.blocked_users, &signer_address), E_USER_BLOCKED);

        let sender_profile = borrow_global_mut<UserProfile>(signer_address);
        let message = Message {
            sender: signer_address,
            content,
            timestamp: timestamp::now_seconds(),
        };

        let sender_conversation = table::borrow_mut(&mut sender_profile.conversations, recipient);
        vector::push_back(&mut sender_conversation.messages, message);

        event::emit_event(
            &mut sender_profile.message_sent_events,
            MessageSentEvent { sender: signer_address, recipient }
        );

        let recipient_profile = borrow_global_mut<UserProfile>(recipient);
        let recipient_conversation = table::borrow_mut(&mut recipient_profile.conversations, signer_address);
        vector::push_back(&mut recipient_conversation.messages, message);
    }

    public entry fun rate_user(
        account: &signer,
        rated_user: address,
        rating: u64
    ) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);
        assert!(exists<UserProfile>(rated_user), E_USER_NOT_FOUND);
        assert!(rating >= 1 && rating <= 5, E_INVALID_RATING);
        assert!(signer_address != rated_user, E_SELF_OPERATION_NOT_ALLOWED);

        let rated_profile = borrow_global_mut<UserProfile>(rated_user);
        // Simple average rating calculation
        rated_profile.user_rating = (rated_profile.user_rating + rating) / 2;
    }

    public entry fun update_profile_picture(
        account: &signer,
        picture_url: String
    ) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);

        let user_profile = borrow_global_mut<UserProfile>(signer_address);
        user_profile.profile_picture = option::some(picture_url);
    }

    // View functions
    #[view]
    public fun get_user_settings(account_address: address): UserSettings acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        user_profile.settings
    }

    #[view]
    public fun get_group_expenses(group_creator: address): vector<Expense> acquires GroupProfile {
        assert!(exists<GroupProfile>(group_creator), E_GROUP_NOT_FOUND);
        let group = borrow_global<GroupProfile>(group_creator);
        group.expense_history
    }

    #[view]
    public fun get_user_rating(account_address: address): u64 acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        user_profile.user_rating
    }

    #[view]
    public fun get_user_stats(account_address: address): (u64, u64) acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        (user_profile.total_transactions, user_profile.user_rating)
    }

    #[view]
    public fun is_user_blocked(blocker: address, blocked: address): bool acquires UserProfile {
        assert!(exists<UserProfile>(blocker), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(blocker);
        vector::contains(&user_profile.blocked_users, &blocked)
    }

    #[view]
    public fun get_user_groups(account_address: address): vector<address> acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        user_profile.groups
    }

    #[view]
    public fun get_profile_details(account_address: address): (String, Option<String>, u64, u64) acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        (
            user_profile.user_name,
            user_profile.profile_picture,
            user_profile.total_transactions,
            user_profile.user_rating
        )
    }
}
